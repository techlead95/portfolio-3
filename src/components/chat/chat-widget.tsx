"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, stagger, useReducedMotion } from "motion/react";
import { profile } from "@/data/resume";
import { cn, EASE_OUT, parseMarks } from "@/lib/utils";
import { ArrowUp, Close, Spark } from "../icons";

type Msg = { role: "user" | "assistant"; content: string };
type Note = { kind: "error"; text: string };
type Item = Msg | Note;

const OPEN_EVENT = "open-chat";
const MAX_CHARS = 500;
const SUGGESTIONS = [
  "What did he achieve at Blackboard?",
  "What AI systems has he shipped?",
  "How strong is he in Java and React?",
  "How can I contact him?",
];

/** Lets any button on the page open the chat. */
export function openChat(question?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: question }));
}

/** **bold** and email links in assistant replies. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {parseMarks(text, "**").map((seg, i) => {
        const parts = seg.text.split(/([\w.+-]+@[\w-]+\.[\w.]+)/g);
        const body = parts.map((p, k) =>
          /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(p) ? (
            <a key={k} href={`mailto:${p}`} className="text-accent-text underline underline-offset-2">
              {p}
            </a>
          ) : (
            <span key={k}>{p}</span>
          ),
        );
        return seg.marked ? (
          <strong key={i} className="font-semibold text-fg">
            {body}
          </strong>
        ) : (
          <span key={i}>{body}</span>
        );
      })}
    </>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-accent-text"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

export function ChatWidget() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim().slice(0, MAX_CHARS);
      if (!question || busy) return;
      setInput("");

      const history: Msg[] = [
        ...items.filter((it): it is Msg => "role" in it),
        { role: "user", content: question },
      ];
      setItems((prev) => [...prev, { role: "user", content: question }, { role: "assistant", content: "" }]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const setLast = (content: string) =>
        setItems((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content };
          return next;
        });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setItems((prev) => [
            ...prev.slice(0, -1),
            { kind: "error", text: data.error ?? `Something went wrong. You can email ${profile.email}.` },
          ]);
          if (res.status === 429) setRemaining(0);
          return;
        }

        const left = res.headers.get("X-RateLimit-Remaining");
        if (left !== null) setRemaining(Number(left));

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          answer += decoder.decode(value, { stream: true });
          setLast(answer);
        }
        if (!answer.trim()) setLast(`Sorry, I couldn't answer that. You can email ${profile.email}.`);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setItems((prev) => {
            const last = prev[prev.length - 1];
            return last && "role" in last && !last.content ? prev.slice(0, -1) : prev;
          });
        } else {
          setItems((prev) => [
            ...prev.slice(0, -1),
            { kind: "error", text: `Connection lost. Please try again, or email ${profile.email}.` },
          ]);
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, items],
  );

  // Open from anywhere (e.g. the contact section), optionally with a question.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string | undefined>).detail;
      if (q) setInput(q);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [items, reduce]);

  const empty = items.length === 0;
  const limited = remaining === 0;

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            className="group fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 rounded-full bg-accent py-3 pl-3.5 pr-5 text-sm font-medium text-accent-ink shadow-[0_14px_40px_-10px_var(--accent)] sm:bottom-7 sm:right-7"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            aria-haspopup="dialog"
          >
            <span className="relative grid size-6 place-items-center">
              {!reduce && <span className="absolute inset-0 animate-ping-slow rounded-full bg-accent-ink/20" />}
              <Spark size={18} className="relative transition-transform duration-500 group-hover:rotate-90" />
            </span>
            Ask my AI
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={`Chat about ${profile.name}`}
            className="fixed inset-x-3 bottom-3 z-[60] flex max-h-[min(640px,calc(100svh-1.5rem))] flex-col overflow-hidden rounded-3xl border border-line-strong bg-elev shadow-[0_40px_120px_-30px_rgb(0_0_0/0.7)] sm:inset-x-auto sm:bottom-7 sm:right-7 sm:w-[400px]"
            style={{ transformOrigin: "bottom right" }}
            initial={{ opacity: 0, scale: 0.85, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 16, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 border-b border-line px-5 py-4">
              <span className="relative grid size-9 place-items-center rounded-full bg-accent text-accent-ink">
                <Spark size={17} />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-elev bg-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold tracking-tight">Ask about {profile.firstName}</p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
                  Answers from his résumé
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
                aria-label="Close chat"
              >
                <Close size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} data-lenis-prevent className="min-h-[260px] flex-1 space-y-3 overflow-y-auto px-5 py-5">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
                className="max-w-[88%] rounded-2xl rounded-bl-md bg-surface px-4 py-3 text-[14.5px] leading-relaxed text-muted"
              >
                Hi! I can answer questions about {profile.firstName}&apos;s experience, results, and skills. What would you
                like to know?
              </motion.div>

              {empty && (
                <motion.ul
                  className="flex flex-wrap gap-2 pt-1"
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { delayChildren: stagger(0.06, { startDelay: 0.3 }) } } }}
                >
                  {SUGGESTIONS.map((s) => (
                    <motion.li
                      key={s}
                      variants={{ hidden: { opacity: 0, y: 8, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } }}
                    >
                      <button
                        type="button"
                        onClick={() => send(s)}
                        disabled={busy || limited}
                        className="rounded-full border border-line-strong px-3 py-1.5 text-left text-[13px] text-fg transition-colors hover:border-accent hover:bg-accent-soft disabled:opacity-50"
                      >
                        {s}
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
              )}

              {items.map((it, i) => {
                if ("kind" in it) {
                  return (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-warn/40 bg-warn/10 px-4 py-3 text-[13.5px] leading-relaxed text-fg"
                    >
                      <Rich text={it.text} />
                    </motion.p>
                  );
                }
                const mine = it.role === "user";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className={cn("flex", mine && "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed",
                        mine ? "rounded-br-md bg-accent text-accent-ink" : "rounded-bl-md bg-surface text-muted",
                      )}
                    >
                      {it.content ? mine ? it.content : <Rich text={it.content} /> : <TypingDots />}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Composer */}
            <form
              className="border-t border-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <div className="flex items-end gap-2 rounded-2xl border border-line-strong bg-bg/60 p-1.5 pl-4 transition-colors focus-within:border-accent">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  rows={1}
                  disabled={limited}
                  placeholder={limited ? "Chat limit reached" : `Ask about ${profile.firstName}…`}
                  aria-label="Your question"
                  className="max-h-28 min-h-9 flex-1 resize-none bg-transparent py-2 text-[14.5px] text-fg outline-none placeholder:text-subtle [field-sizing:content] focus-visible:outline-none"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={() => abortRef.current?.abort()}
                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-fg transition-colors hover:bg-line-strong"
                    aria-label="Stop answering"
                  >
                    <span className="size-3 rounded-[3px] bg-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || limited}
                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink transition-[opacity,transform] hover:scale-105 disabled:scale-100 disabled:opacity-35"
                    aria-label="Send"
                  >
                    <ArrowUp size={17} />
                  </button>
                )}
              </div>
              <p className="mt-2 flex justify-between px-1 font-mono text-[10px] text-subtle">
                <span>AI can make mistakes. Verify with {profile.firstName}.</span>
                <span>
                  {remaining !== null && remaining > 0
                    ? `${remaining} left`
                    : input.length > MAX_CHARS * 0.8
                      ? `${input.length}/${MAX_CHARS}`
                      : ""}
                </span>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
