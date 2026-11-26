import Anthropic from "@anthropic-ai/sdk";
import { profile } from "@/data/resume";
import { SYSTEM_PROMPT } from "@/lib/chat-context";
import { takeChatToken, visitorId } from "@/lib/rate-limit";

const MODEL = "claude-opus-5-5";
const MAX_MESSAGES = 12; // conversation window sent to the model
const MAX_USER_CHARS = 500;
const MAX_ASSISTANT_CHARS = 4000;

type ChatMessage = { role: "user" | "assistant"; content: string };

const json = (status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Validates the client's history and trims it to a short, well-formed window. */
function readMessages(body: unknown): Anthropic.Beta.BetaMessageParam[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const raw = (body as { messages: unknown[] }).messages;

  const msgs: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    if (!text) continue;
    if (text.length > (role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS)) return null;
    msgs.push({ role, content: text });
  }

  let windowed = msgs.slice(-MAX_MESSAGES);
  while (windowed.length && windowed[0].role !== "user") windowed = windowed.slice(1);
  if (!windowed.length || windowed[windowed.length - 1].role !== "user") return null;
  return windowed;
}

/** Only accept calls from this site's own pages. */
function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetches from some browsers omit it
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json(403, { error: "Forbidden." });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid request." });
  }
  const messages = readMessages(body);
  if (!messages) {
    return json(400, { error: `Please keep questions under ${MAX_USER_CHARS} characters.` });
  }

  const limit = takeChatToken(visitorId(req.headers));
  if (!limit.ok) {
    const minutes = Math.ceil(limit.retryAfter / 60);
    const message =
      limit.scope === "global"
        ? `The assistant has hit its daily limit. Please email ${profile.email} instead.`
        : `You've reached the chat limit. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}, or email ${profile.email}.`;
    return json(429, { error: message, retryAfter: limit.retryAfter }, { "Retry-After": String(limit.retryAfter) });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return json(503, { error: `The assistant isn't set up yet. Please email ${profile.email}.` });
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream(
    {
      model: MODEL,
      max_tokens: 2048, // answers are a few sentences; this also caps cost per message
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // if a request is declined, the API retries it on a fallback model
      output_config: { effort: "low" }, // short factual Q&A: low effort keeps it fast and cheap
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
    },
    { signal: req.signal },
  );

  const encoder = new TextEncoder();
  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (s: string) => controller.enqueue(encoder.encode(s));
      let wrote = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            wrote = true;
            write(event.delta.text);
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" && !wrote) {
          write(`I can't help with that one, but I'm happy to answer questions about ${profile.firstName}'s work.`);
        }
      } catch (err) {
        if (!req.signal.aborted) {
          if (err instanceof Anthropic.AuthenticationError) console.error("[chat] Invalid ANTHROPIC_API_KEY");
          else if (err instanceof Anthropic.RateLimitError) console.error("[chat] Anthropic rate limit hit");
          else if (err instanceof Anthropic.APIError) console.error(`[chat] API error ${err.status}: ${err.message}`);
          else console.error("[chat] Stream failed:", err);
          write(
            wrote
              ? "\n\n(The answer was cut off. Please try again.)"
              : `Sorry, the assistant is unavailable right now. You can email ${profile.email}.`,
          );
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(out, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-RateLimit-Remaining": String(limit.remaining),
    },
  });
}
