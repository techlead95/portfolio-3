"use client";

import { motion, stagger } from "motion/react";
import type { Viz } from "@/data/resume";
import { cn, EASE_OUT } from "@/lib/utils";

const VIEW = { once: true, margin: "0px 0px -12% 0px" } as const;

/** Before → now bars that grow into place. */
function Compare({ viz }: { viz: Extract<Viz, { kind: "compare" }> }) {
  return (
    <motion.ul className="space-y-2" initial="hidden" whileInView="show" viewport={VIEW}>
      {viz.rows.map((r, i) => {
        const now = i === viz.rows.length - 1;
        return (
          <li key={r.label} className="grid grid-cols-[4.6rem_1fr_3.2rem] items-center gap-3 font-mono text-[11px]">
            <span className={cn("uppercase tracking-[0.14em]", now ? "text-accent-text" : "text-subtle")}>{r.label}</span>
            <span className="relative h-2 overflow-hidden rounded-full bg-line">
              <motion.span
                className={cn("absolute inset-y-0 left-0 rounded-full", now ? "bg-accent" : "bg-line-strong")}
                style={{ width: `${Math.max(3, (r.value / viz.max) * 100)}%`, originX: 0 }}
                variants={{
                  hidden: { scaleX: 0 },
                  show: { scaleX: 1, transition: { duration: 1.3, delay: 0.35 + i * 0.35, ease: EASE_OUT } },
                }}
              />
              {now && (
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 w-10 bg-linear-to-r from-transparent via-white/50 to-transparent"
                  variants={{
                    hidden: { left: "-15%" },
                    show: { left: "115%", transition: { duration: 1.1, delay: 1.4, ease: "easeInOut" } },
                  }}
                />
              )}
            </span>
            <span className={cn("text-right tabular-nums", now ? "text-fg" : "text-subtle line-through decoration-subtle/60")}>
              {r.text}
            </span>
          </li>
        );
      })}
    </motion.ul>
  );
}

/** Four cost levers light up one after another along a wire. */
function Levers({ viz }: { viz: Extract<Viz, { kind: "levers" }> }) {
  return (
    <div>
      <div className="relative flex items-center justify-between">
        <span aria-hidden className="absolute inset-x-2 top-1/2 h-px bg-line" />
        <motion.span
          aria-hidden
          className="absolute inset-x-2 top-1/2 h-px origin-left bg-accent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEW}
          transition={{ duration: 1.6, delay: 0.3, ease: "easeInOut" }}
        />
        {viz.items.map((item, i) => (
          <motion.span
            key={item}
            className="relative rounded-full border bg-elev px-2.5 py-1 font-mono text-[10.5px] tracking-wide"
            initial={{ borderColor: "var(--line)", color: "var(--subtle)", scale: 0.9 }}
            whileInView={{ borderColor: "var(--accent)", color: "var(--fg)", scale: 1 }}
            viewport={VIEW}
            transition={{ duration: 0.45, delay: 0.35 + i * 0.4, ease: EASE_OUT }}
          >
            {item}
          </motion.span>
        ))}
      </div>
      <p className="mt-2.5 font-mono text-[11px] text-subtle">{viz.note}</p>
    </div>
  );
}

const DAYS = ["M", "T", "W", "T", "F"];

/** A 5 × 8 work week where one whole day lights up. */
function Week({ viz }: { viz: Extract<Viz, { kind: "week" }> }) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-1.5">
        {DAYS.map((d, di) => (
          <div key={di} className="space-y-1">
            <div className="grid grid-rows-8 gap-[3px]">
              {Array.from({ length: 8 }, (_, h) => {
                const saved = di === DAYS.length - 1;
                return saved ? (
                  <motion.span
                    key={h}
                    className="h-1.5 rounded-[2px]"
                    initial={{ backgroundColor: "var(--line)", scaleX: 0.6 }}
                    whileInView={{ backgroundColor: "var(--accent)", scaleX: 1 }}
                    viewport={VIEW}
                    transition={{ duration: 0.35, delay: 0.5 + (7 - h) * 0.11, ease: EASE_OUT }}
                  />
                ) : (
                  <span key={h} className="h-1.5 rounded-[2px] bg-line" />
                );
              })}
            </div>
            <p className={cn("text-center font-mono text-[10px]", di === DAYS.length - 1 ? "text-accent-text" : "text-subtle")}>
              {d}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[11px] text-subtle">{viz.note}</p>
    </div>
  );
}

/** A ring that closes to the SLA, with a pulse on completion. */
function Ring({ viz }: { viz: Extract<Viz, { kind: "ring" }> }) {
  const r = 20;
  return (
    <div className="flex items-center gap-4">
      <span className="relative grid size-14 shrink-0 place-items-center">
        <svg viewBox="0 0 48 48" className="size-14 -rotate-90" aria-hidden>
          <circle cx="24" cy="24" r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
          <motion.circle
            cx="24"
            cy="24"
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: viz.value / 100 }}
            viewport={VIEW}
            transition={{ duration: 1.8, delay: 0.3, ease: EASE_OUT }}
          />
        </svg>
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-accent"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: [0.8, 1.35], opacity: [0, 0.8, 0] }}
          viewport={VIEW}
          transition={{ duration: 1.1, delay: 1.7, ease: "easeOut" }}
        />
      </span>
      <p className="font-mono text-[11px] leading-relaxed text-subtle">{viz.note}</p>
    </div>
  );
}

/** 100 dots, lighting up to the recall rate; the misses stay dark. */
function Dots({ viz }: { viz: Extract<Viz, { kind: "dots" }> }) {
  return (
    <div>
      <motion.div
        className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[3px]"
        initial="hidden"
        whileInView="show"
        viewport={VIEW}
        variants={{ hidden: {}, show: { transition: { delayChildren: stagger(0.012, { startDelay: 0.3 }) } } }}
      >
        {Array.from({ length: 100 }, (_, k) => (
          <motion.span
            key={k}
            className="aspect-square rounded-full"
            variants={{
              hidden: { backgroundColor: "var(--line)", scale: 0.4 },
              show: {
                backgroundColor: k < viz.value ? "var(--accent)" : "var(--line-strong)",
                scale: 1,
                transition: { duration: 0.3, ease: EASE_OUT },
              },
            }}
          />
        ))}
      </motion.div>
      <p className="mt-2.5 font-mono text-[11px] text-subtle">{viz.note}</p>
    </div>
  );
}

export function ImpactViz({ viz }: { viz: Viz }) {
  switch (viz.kind) {
    case "compare":
      return <Compare viz={viz} />;
    case "levers":
      return <Levers viz={viz} />;
    case "week":
      return <Week viz={viz} />;
    case "ring":
      return <Ring viz={viz} />;
    case "dots":
      return <Dots viz={viz} />;
  }
}
