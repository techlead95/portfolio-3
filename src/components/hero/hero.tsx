"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { profile } from "@/data/resume";
import { introDelay } from "@/lib/intro";
import { EASE_OUT } from "@/lib/utils";
import { ArrowDown, Download, FileText } from "../icons";
import { openResume } from "../resume-viewer";
import { LocalTime } from "../ui/client-clock";
import { Magnetic, RollText, ScrambleText, Tilt } from "../ui/motion-primitives";
import { AgentTrace } from "./agent-trace";
import { SignalField } from "./signal-field";

const HOVER_SPRING = { type: "spring", stiffness: 520, damping: 14 } as const;

/** Letters float up out of a blur on load (no clipping), then each springs up on hover. */
function Letters({ text, delay, className }: { text: string; delay: number; className?: string }) {
  const [settled, setSettled] = useState(false);
  return (
    <span className={className} aria-hidden>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block transition-colors duration-300 will-change-transform hover:text-accent-text"
          initial={{ y: "40%", rotate: 8, opacity: 0, filter: "blur(12px)" }}
          animate={{ y: "0%", rotate: 0, opacity: 1, filter: "blur(0px)" }}
          whileHover={{ y: "-9%", rotate: i % 2 ? 5 : -5, transition: HOVER_SPRING }}
          transition={settled ? HOVER_SPRING : { duration: 1.1, delay: delay + i * 0.05, ease: EASE_OUT }}
          onAnimationComplete={i === text.length - 1 ? () => setSettled(true) : undefined}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1, delay, ease: EASE_OUT },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [D] = useState(introDelay); // wait for the intro curtain on first visit
  const reduce = useReducedMotion();

  // Scroll-linked depth: name lags, terminal leads, backdrop drifts.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const nameY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const nameScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const traceY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const backY = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const depth = (style: Record<string, unknown>) => (reduce ? undefined : style);

  return (
    <section ref={ref} id="top" className="relative isolate overflow-hidden">
      {/* Backdrop */}
      <motion.div aria-hidden className="absolute inset-0 -z-10" style={depth({ y: backY })}>
        <SignalField className="absolute inset-0 [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,transparent_20%,#000_46%,#000_86%,transparent),radial-gradient(ellipse_34%_20%_at_24%_70%,transparent_35%,#000_100%)] max-lg:[mask-image:linear-gradient(to_bottom,transparent_25svh,#000_55svh,#000_80%,transparent)]" />
        <motion.div
          className="absolute -right-40 -top-40 size-[620px] rounded-full bg-accent/10 blur-[140px]"
          animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-b from-transparent to-bg" />

      <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col px-5 pb-8 pt-28 sm:px-8 sm:pt-32">
        <motion.p
          {...fadeUp(D + 0.1)}
          className="inline-flex w-fit items-center gap-2.5 rounded-full border border-line bg-elev/60 py-1.5 pl-2 pr-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted backdrop-blur"
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping-slow rounded-full bg-accent opacity-60" />
            <span className="relative size-2 rounded-full bg-accent" />
          </span>
          <ScrambleText text={profile.role} delay={D + 0.2} />
        </motion.p>

        <motion.h1
          style={depth({ y: nameY, scale: nameScale, opacity: fade, transformOrigin: "left bottom" })}
          className="mt-8 text-[clamp(3.6rem,12.5vw,10.5rem)] font-semibold leading-[0.88] tracking-[-0.055em]"
        >
          <span className="sr-only">{profile.name}</span>
          <Letters text={profile.firstName} delay={D + 0.2} />{" "}
          <Letters
            text={profile.lastName}
            delay={D + 0.38}
            className="font-serif text-[1.08em] font-normal italic tracking-[-0.03em]"
          />
        </motion.h1>

        <div className="mt-10 grid items-end gap-12 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
          <motion.div style={depth({ opacity: fade })}>
            <motion.p
              {...fadeUp(D + 0.75)}
              className="max-w-xl text-pretty text-xl leading-snug text-muted sm:text-2xl sm:leading-snug"
            >
              {profile.years} years building secure, scalable software across{" "}
              <span className="text-fg">Java, Python, and React</span>. Now I bring{" "}
              <span className="font-serif text-[1.15em] italic text-accent-text">production AI</span> to enterprise
              systems, reliably and cost-efficiently.
            </motion.p>

            <motion.div {...fadeUp(D + 0.9)} className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href="#impact"
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink shadow-[0_10px_40px_-10px_var(--accent)] transition-shadow hover:shadow-[0_14px_50px_-8px_var(--accent)]"
                >
                  <RollText>See my work</RollText>
                  <ArrowDown size={16} className="transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
              </Magnetic>
              <Magnetic>
                <button
                  type="button"
                  onClick={openResume}
                  className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-elev/60 px-6 py-3.5 text-sm font-medium backdrop-blur transition-colors hover:border-fg"
                >
                  <RollText>View résumé</RollText>
                  <FileText size={16} className="transition-transform duration-300 group-hover:-rotate-6" />
                </button>
              </Magnetic>
              {/* Phones open the PDF in the browser viewer, which has its own download button. */}
              <Magnetic className="max-sm:hidden">
                <a
                  href={profile.resumeUrl}
                  download
                  aria-label="Download résumé (PDF)"
                  title="Download résumé (PDF)"
                  className="group grid size-12 place-items-center rounded-full border border-line-strong bg-elev/60 backdrop-blur transition-colors hover:border-fg"
                >
                  <Download size={17} className="transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
              </Magnetic>
            </motion.div>
          </motion.div>

          <motion.div style={depth({ y: traceY })}>
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 18 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.2, delay: D + 0.85, ease: EASE_OUT }}
              style={{ transformPerspective: 1200 }}
            >
              <Tilt max={6}>
                <AgentTrace startDelay={D} />
              </Tilt>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: D + 1.3 }}
          className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle max-lg:mt-14"
        >
          <span>
            {profile.location} · <LocalTime />
          </span>
          <span className="hidden xl:block">
            Shipped at <span className="text-muted">{profile.companies.join(" · ")}</span>
          </span>
          <span className="flex items-center gap-2">
            Scroll
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown size={13} />
            </motion.span>
          </span>
        </motion.div>
      </div>
    </section>
  );
}
