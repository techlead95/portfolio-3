/**
 * In-memory rate limiting for the chat endpoint.
 *
 * Three layers, all configurable through env vars:
 *  - burst:   CHAT_LIMIT_PER_10_MIN  messages per visitor per 10 minutes (default 8)
 *  - daily:   CHAT_LIMIT_PER_DAY     messages per visitor per 24 hours   (default 30)
 *  - global:  CHAT_GLOBAL_DAILY_LIMIT messages across all visitors per 24 hours (default 500),
 *             a hard ceiling on what the API key can be spent on in a day.
 *
 * State lives in this server process. That is right for a single Node server
 * (`next start`, a VPS, a container). On serverless or multi-instance hosting each
 * instance keeps its own counters, so swap `store` for a shared one (e.g. Redis/Upstash).
 */

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const LIMITS = {
  burst: { max: num(process.env.CHAT_LIMIT_PER_10_MIN, 8), window: 10 * MINUTE },
  daily: { max: num(process.env.CHAT_LIMIT_PER_DAY, 30), window: DAY },
  global: { max: num(process.env.CHAT_GLOBAL_DAILY_LIMIT, 500), window: DAY },
};

type Hits = number[];
const store = new Map<string, Hits>();
let lastSweep = Date.now();

/** Drop timestamps older than the longest window so memory stays bounded. */
function sweep(now: number) {
  if (now - lastSweep < 5 * MINUTE) return;
  lastSweep = now;
  for (const [key, hits] of store) {
    const kept = hits.filter((t) => now - t < DAY);
    if (kept.length) store.set(key, kept);
    else store.delete(key);
  }
}

function countSince(hits: Hits, now: number, window: number) {
  let n = 0;
  for (let i = hits.length - 1; i >= 0 && now - hits[i] < window; i--) n++;
  return n;
}

/** Seconds until enough hits fall out of the window to allow one more. */
function retryAfter(hits: Hits, now: number, window: number, max: number) {
  const inWindow = hits.filter((t) => now - t < window);
  const oldestBlocking = inWindow[inWindow.length - max];
  return Math.max(1, Math.ceil((oldestBlocking + window - now) / 1000));
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; scope: "burst" | "daily" | "global"; retryAfter: number };

/** Checks every layer and, only if all pass, records the hit. */
export function takeChatToken(visitor: string): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const mine = store.get(visitor) ?? [];
  const everyone = store.get("__global__") ?? [];

  const checks = [
    { scope: "global" as const, hits: everyone, ...LIMITS.global },
    { scope: "daily" as const, hits: mine, ...LIMITS.daily },
    { scope: "burst" as const, hits: mine, ...LIMITS.burst },
  ];
  for (const c of checks) {
    if (countSince(c.hits, now, c.window) >= c.max) {
      return { ok: false, scope: c.scope, retryAfter: retryAfter(c.hits, now, c.window, c.max) };
    }
  }

  mine.push(now);
  everyone.push(now);
  store.set(visitor, mine);
  store.set("__global__", everyone);

  const remaining = Math.min(
    LIMITS.burst.max - countSince(mine, now, LIMITS.burst.window),
    LIMITS.daily.max - countSince(mine, now, LIMITS.daily.window),
  );
  return { ok: true, remaining };
}

/** Best-effort client identity from proxy headers. */
export function visitorId(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || headers.get("cf-connecting-ip") || "unknown";
}
