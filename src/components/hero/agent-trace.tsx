"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { traces } from "@/data/resume";
import { cn, EASE_OUT } from "@/lib/utils";

const KIND_STYLES: Record<string, string> = {
  mcp: "text-sky-500 dark:text-sky-300",
  rag: "text-violet-500 dark:text-violet-300",
  route: "text-accent-text",
  guard: "text-warn",
  embed: "text-sky-500 dark:text-sky-300",
  rank: "text-violet-500 dark:text-violet-300",
  llm: "text-accent-text",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A looping, illustrative agent run — the kind of system Luis ships. */
export function AgentTrace({ className, startDelay = 0 }: { className?: string; startDelay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const idxRef = useRef(0);
  const startedRef = useRef(false);
  const [state, setState] = useState({ idx: 0, typed: 0, lines: 0, done: false });

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;

    (async () => {
      await sleep(reduce ? 0 : 900 + (startedRef.current ? 0 : startDelay * 1000));
      startedRef.current = true;
      while (!cancelled) {
        const idx = idxRef.current;
        const t = traces[idx];
        if (reduce) {
          setState({ idx, typed: t.command.length, lines: t.steps.length, done: true });
          await sleep(6000);
        } else {
          setState({ idx, typed: 0, lines: 0, done: false });
          await sleep(350);
          for (let i = 1; i <= t.command.length && !cancelled; i++) {
            setState((s) => ({ ...s, typed: i }));
            await sleep(22 + Math.random() * 30);
          }
          await sleep(300);
          for (let l = 1; l <= t.steps.length && !cancelled; l++) {
            setState((s) => ({ ...s, lines: l }));
            await sleep(380 + Math.random() * 260);
          }
          if (cancelled) break;
          setState((s) => ({ ...s, done: true }));
          await sleep(3600);
        }
        idxRef.current = (idx + 1) % traces.length;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inView, reduce, startDelay]);

  const trace = traces[state.idx];
  const running = !state.done;

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-line bg-elev/80 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.5)] backdrop-blur-xl",
        className,
      )}
    >
      {/* Chrome */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={trace.file}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="ml-3 font-mono text-[11px] text-subtle"
            >
              {trace.file}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
          <span className="relative flex size-1.5">
            {running && <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-70" />}
            <span className={cn("relative size-1.5 rounded-full", running ? "bg-accent" : "bg-subtle")} />
          </span>
          {running ? "running" : "complete"}
        </span>
      </div>

      {/* Body */}
      <div className="min-h-[252px] px-4 py-4 font-mono text-[12px] leading-[1.9] sm:text-[12.5px]">
        <p className="break-all text-fg">
          <span className="select-none text-accent-text">❯ </span>
          {trace.command.slice(0, state.typed)}
          {state.lines === 0 && !state.done && (
            <span className="ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] animate-blink bg-accent" />
          )}
        </p>
        <ul className="mt-1">
          {trace.steps.slice(0, state.lines).map((s) => (
            <motion.li
              key={`${state.idx}-${s.name}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="grid grid-cols-[auto_3.2rem_1fr_auto] items-center gap-2 text-muted"
            >
              <span className="text-subtle">↳</span>
              <span className={cn("text-[10.5px] uppercase tracking-wider", KIND_STYLES[s.kind])}>{s.kind}</span>
              <span className="truncate text-fg/90">{s.name}</span>
              <span className={cn("tabular-nums", s.status === "warn" ? "text-warn" : "text-subtle")}>
                {s.meta} <span className={s.status === "warn" ? "text-warn" : "text-accent-text"}>{s.status === "warn" ? "◆" : "✓"}</span>
              </span>
            </motion.li>
          ))}
        </ul>
        <AnimatePresence>
          {state.done && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="mt-2 border-t border-dashed border-line pt-2 text-accent-text"
            >
              ✓ {trace.result}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Footer meta */}
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[10.5px] text-subtle">
        <span>python · fastapi · langgraph</span>
        <span className="flex gap-1">
          {traces.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                i === state.idx ? "w-5 bg-accent" : "w-1.5 bg-line-strong",
              )}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
