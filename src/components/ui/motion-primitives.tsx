"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  stagger,
  useInView,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import { cn, EASE_OUT, parseMarks } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Reveal — fade/slide/blur in when scrolled into view                 */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  blur = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(6px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* SplitWords — masked word-by-word rise. *text* renders as serif em.   */
/* ------------------------------------------------------------------ */
const wordParent: Variants = {
  hidden: {},
  show: ({ interval, delay }: { interval: number; delay: number }) => ({
    transition: { delayChildren: stagger(interval, { startDelay: delay }) },
  }),
};
const wordChild: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.95, ease: EASE_OUT } },
};

export function SplitWords({
  text,
  className,
  emClassName,
  interval = 0.045,
  delay = 0,
  animateOnMount = false,
}: {
  text: string;
  className?: string;
  emClassName?: string;
  interval?: number;
  delay?: number;
  animateOnMount?: boolean;
}) {
  const segments = parseMarks(text, "*");
  const trigger = animateOnMount
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, margin: "0px 0px -10% 0px" } };

  return (
    <motion.span
      className={cn("inline", className)}
      initial="hidden"
      {...trigger}
      variants={wordParent}
      custom={{ interval, delay }}
    >
      <span className="sr-only">{segments.map((s) => s.text).join("")}</span>
      <span aria-hidden>
        {segments.map((seg, si) =>
          seg.text.split(/(\s+)/).map((word, wi) => {
            if (!word) return null;
            if (/^\s+$/.test(word)) return <span key={`${si}-${wi}`}> </span>;
            return (
              <span
                key={`${si}-${wi}`}
                className="-mb-[0.2em] -mr-[0.05em] inline-block overflow-hidden pb-[0.2em] pr-[0.05em] align-bottom"
              >
                <motion.span
                  variants={wordChild}
                  className={cn(
                    "inline-block will-change-transform",
                    seg.marked &&
                      cn("font-serif text-[1.08em] font-normal italic tracking-[-0.01em]", emClassName),
                  )}
                >
                  {word}
                </motion.span>
              </span>
            );
          }),
        )}
      </span>
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic — element drifts toward the cursor                          */
/* ------------------------------------------------------------------ */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={cn("inline-block", className)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* SpotlightCard — cursor-following glow                               */
/* ------------------------------------------------------------------ */
export function SpotlightCard({
  children,
  className,
  glow = "var(--accent-soft)",
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "group/spot relative isolate overflow-hidden rounded-3xl border border-line bg-elev transition-colors duration-500 hover:border-line-strong",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(480px circle at var(--mx, 50%) var(--my, 50%), ${glow}, transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RichText — **bold** segments get a highlighter sweep when visible   */
/* ------------------------------------------------------------------ */
export function RichText({ text, strongClassName }: { text: string; strongClassName?: string }) {
  return (
    <>
      {parseMarks(text, "**").map((s, i) =>
        s.marked ? (
          <motion.strong
            key={i}
            className={cn("bg-no-repeat font-medium text-fg [box-decoration-break:clone]", strongClassName)}
            style={{ backgroundImage: "linear-gradient(transparent 58%, var(--highlight) 58%)" }}
            initial={{ backgroundSize: "0% 100%" }}
            whileInView={{ backgroundSize: "100% 100%" }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 1, delay: 0.35, ease: EASE_OUT }}
          >
            {s.text}
          </motion.strong>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* ScrambleText — decodes from random glyphs, left to right             */
/* ------------------------------------------------------------------ */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

export function ScrambleText({
  text,
  className,
  delay = 0,
  speed = 32,
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number; // ms per character
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce) return;
    const duration = Math.max(450, text.length * speed);
    const start = performance.now() + delay * 1000;
    let raf = 0;
    let lastSwap = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      if (now - lastSwap > 45 || p >= 1) {
        lastSwap = now;
        const revealed = Math.max(0, Math.floor(p * text.length));
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          out += i < revealed || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
      }
      if (p < 1) raf = requestAnimationFrame(tick);
      else el.textContent = text;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [inView, reduce, text, delay, speed]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* RollingNumber — odometer-style digits that spin into place           */
/* ------------------------------------------------------------------ */
function Digit({ digit, index }: { digit: number; index: number }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden">
      <span className="invisible">0</span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={{ y: "0%" }}
        whileInView={{ y: `-${(10 + digit) * 5}%` }}
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        transition={{ duration: 1.5 + index * 0.18, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {Array.from({ length: 20 }, (_, n) => (
          <span key={n} className="h-[1em]">
            {n % 10}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function RollingNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const str = value.toFixed(decimals);
  let d = 0;
  return (
    <span className={cn("inline-flex leading-none tabular-nums", className)}>
      <span className="sr-only">{`${prefix}${str}${suffix}`}</span>
      <span aria-hidden className="inline-flex">
        {`${prefix}${str}${suffix}`.split("").map((ch, i) =>
          /\d/.test(ch) ? (
            <Digit key={i} digit={Number(ch)} index={d++} />
          ) : (
            <span key={i} className="inline-block h-[1em]">
              {ch}
            </span>
          ),
        )}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tilt — 3D perspective tilt that follows the pointer                 */
/* ------------------------------------------------------------------ */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 180, damping: 18 });
  const ry = useSpring(0, { stiffness: 180, damping: 18 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* RollText — label rolls up to a copy of itself on parent .group hover */
/* ------------------------------------------------------------------ */
export function RollText({ children }: { children: string }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{children}</span>
      <span
        aria-hidden
        className="absolute inset-0 translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}
