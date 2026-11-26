"use client";

import { useState } from "react";
import { AnimatePresence, motion, stagger } from "motion/react";
import { needs, toolkit, type NeedIcon } from "@/data/resume";
import { cn, EASE_OUT } from "@/lib/utils";
import { AppWindow, CheckCircle, Cloud, Database, Quote, Server, Shield, Spark } from "../icons";
import { SectionHeading } from "../ui/section-heading";
import { RichText } from "../ui/motion-primitives";

const VIEW = { once: true, margin: "0px 0px -10% 0px" } as const;
const ICONS: Record<NeedIcon, typeof Spark> = {
  spark: Spark,
  server: Server,
  window: AppWindow,
  shield: Shield,
  database: Database,
  cloud: Cloud,
  check: CheckCircle,
};
const TOOLS = toolkit.flatMap((g) => g.items);

/* ------------------------------------------------------------------ */
/* Left: the needs. The active one gets a sliding accent pill.          */
/* ------------------------------------------------------------------ */
function NeedList({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  return (
    <motion.ul
      role="tablist"
      aria-label="What do you need built?"
      aria-orientation="vertical"
      className="space-y-1"
      initial="hidden"
      whileInView="show"
      viewport={VIEW}
      variants={{ hidden: {}, show: { transition: { delayChildren: stagger(0.06, { startDelay: 0.2 }) } } }}
    >
      {needs.map((n, i) => {
        const on = i === active;
        const Icon = ICONS[n.icon];
        return (
          <motion.li
            key={n.title}
            variants={{
              hidden: { opacity: 0, x: -24 },
              show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT } },
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="need-panel"
              onPointerEnter={(e) => e.pointerType === "mouse" && onPick(i)}
              onFocus={() => onPick(i)}
              onClick={() => onPick(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const next = (i + (e.key === "ArrowDown" ? 1 : needs.length - 1)) % needs.length;
                  onPick(next);
                  (e.currentTarget.closest("ul")?.querySelectorAll("button")[next] as HTMLButtonElement)?.focus();
                }
              }}
              className={cn(
                "group relative isolate flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left transition-colors duration-300",
                on ? "text-accent-ink" : "text-fg hover:bg-surface/60",
              )}
            >
              {on && (
                <motion.span
                  layoutId="need-pill"
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-2xl bg-accent shadow-[0_10px_40px_-12px_var(--accent)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <motion.span
                key={on ? "on" : "off"}
                initial={on ? { rotate: -90, scale: 0.4 } : false}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 14 }}
                className={cn("shrink-0", on ? "text-accent-ink" : "text-muted group-hover:text-accent-text")}
              >
                <Icon size={18} />
              </motion.span>
              <span className="flex-1 text-[15px] font-medium sm:text-base">{n.title}</span>
              <span
                className={cn(
                  "hidden font-mono text-[11px] uppercase tracking-[0.16em] sm:block",
                  on ? "text-accent-ink/70" : "text-subtle",
                )}
              >
                {n.tag}
              </span>
            </button>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

/* ------------------------------------------------------------------ */
/* Right: every tool; the ones this need uses light up in a cascade.    */
/* ------------------------------------------------------------------ */
function ToolCloud({ active }: { active: number }) {
  const lit = needs[active].tools;
  return (
    <div>
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
        Toolkit · {TOOLS.length} tools ·
        <span className="relative inline-flex overflow-hidden text-accent-text">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={active}
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              {lit.length} in play
            </motion.span>
          </AnimatePresence>
        </span>
      </p>
      <motion.ul
        className="mt-4 flex flex-wrap gap-1.5 [perspective:700px]"
        initial="hidden"
        whileInView="show"
        viewport={VIEW}
        variants={{ hidden: {}, show: { transition: { delayChildren: stagger(0.012, { startDelay: 0.3 }) } } }}
      >
        {TOOLS.map((tool) => {
          const rank = lit.indexOf(tool);
          const on = rank !== -1;
          return (
            <motion.li
              key={tool}
              variants={{
                hidden: { opacity: 0, rotateX: -80, y: 10 },
                show: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
              }}
            >
              <motion.span
                className="block rounded-full border px-3 py-1.5 text-[13px] font-medium"
                animate={
                  on
                    ? {
                        backgroundColor: "var(--accent)",
                        borderColor: "var(--accent)",
                        color: "var(--accent-ink)",
                        opacity: 1,
                        scale: [0.85, 1.08, 1],
                      }
                    : {
                        backgroundColor: "rgb(0 0 0 / 0)",
                        borderColor: "var(--line)",
                        color: "var(--subtle)",
                        opacity: 0.7,
                        scale: 1,
                      }
                }
                transition={{
                  duration: on ? 0.45 : 0.3,
                  delay: on ? rank * 0.035 : 0,
                  ease: EASE_OUT,
                }}
              >
                {tool}
              </motion.span>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Proof card: swaps with a blur-slide; the number gets a highlighter.  */
/* ------------------------------------------------------------------ */
function Proof({ active }: { active: number }) {
  const n = needs[active];
  const Icon = ICONS[n.icon];
  return (
    <div
      id="need-panel"
      role="tabpanel"
      className="relative overflow-hidden rounded-3xl border border-line bg-elev p-6 sm:p-7"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-accent/15 blur-3xl"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={active}
              className="grid size-9 place-items-center rounded-xl bg-accent text-accent-ink"
              initial={{ scale: 0, rotate: -120 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 120 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <Icon size={17} />
            </motion.span>
          </AnimatePresence>
          Proof it works
        </p>
        <Quote size={22} className="text-accent-text" />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <p className="mt-5 text-pretty text-lg font-medium leading-snug tracking-[-0.01em] text-fg sm:text-xl">
            <RichText text={n.proof} strongClassName="font-semibold" />
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">{n.where}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function Skills() {
  const [active, setActive] = useState(0);

  return (
    <section id="skills" className="relative border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div>
            <SectionHeading index="03" label="Skills" title="What do you *need built?*" />
            <p className="mt-4 max-w-md text-pretty text-lg leading-relaxed text-muted">
              <span className="hidden [@media(hover:hover)]:inline">Hover</span>
              <span className="[@media(hover:hover)]:hidden">Tap</span> one. You&apos;ll see the tools I&apos;d reach for and where I&apos;ve already used them.
            </p>
            <div className="mt-8">
              <NeedList active={active} onPick={setActive} />
            </div>
          </div>

          <motion.div
            className="flex flex-col gap-6 lg:pt-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW}
            transition={{ duration: 1, delay: 0.15, ease: EASE_OUT }}
          >
            <div className="max-lg:order-2">
              <ToolCloud active={active} />
            </div>
            <div className="max-lg:order-1">
              <Proof active={active} />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
