"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { focus, outcomes, summary } from "@/data/resume";
import { cn, parseMarks } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Scroll-lit statement — each word brightens as you scroll past it     */
/* ------------------------------------------------------------------ */
function Word({
  children,
  progress,
  range,
  marked,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  marked: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, ["0.18em", "0em"]);
  const blur = useTransform(progress, range, ["blur(4px)", "blur(0px)"]);
  return (
    <motion.span
      style={{ opacity, y, filter: blur }}
      className={cn(
        "inline-block will-change-[opacity,transform]",
        marked && "font-serif text-[1.1em] font-normal italic tracking-[-0.01em] text-accent-text",
      )}
    >
      {children}
    </motion.span>
  );
}

function ScrollLit({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });

  const words = parseMarks(text, "*").flatMap((seg) =>
    seg.text
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({ w, marked: seg.marked })),
  );
  const n = words.length;

  return (
    <p
      ref={ref}
      className="max-w-5xl text-balance text-[clamp(1.85rem,4.4vw,3.6rem)] font-medium leading-[1.12] tracking-[-0.035em]"
    >
      <span className="sr-only">{text.replace(/\*/g, "")}</span>
      <span aria-hidden className="flex flex-wrap gap-x-[0.26em]">
        {words.map(({ w, marked }, i) =>
          reduce ? (
            <span key={i} className={cn(marked && "font-serif italic text-accent-text")}>
              {w}
            </span>
          ) : (
            <Word key={i} progress={scrollYProgress} range={[i / n, (i + 1.5) / n]} marked={marked}>
              {w}
            </Word>
          ),
        )}
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Velocity marquee — drifts on its own, surges and skews with scroll   */
/* ------------------------------------------------------------------ */
const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

function MarqueeRow({
  speed,
  className,
  separator,
  items,
  decorative = false,
}: {
  speed: number; // % of one copy per second
  className?: string;
  separator: React.ReactNode;
  items: { key: string; node: React.ReactNode }[];
  decorative?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const skew = useTransform(velocity, [-2500, 2500], [10, -10]);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (!inView || reduce) return;
    const b = boost.get();
    if (b < 0) dir.current = -1;
    else if (b > 0) dir.current = 1;
    const move = dir.current * speed * (delta / 1000);
    base.set(base.get() + move + move * Math.abs(b));
  });

  const copy = (
    <span className="flex shrink-0 items-center">
      {items.map((it) => (
        <span key={it.key} className="flex items-center">
          <span className="px-[0.45em]">{it.node}</span>
          {separator}
        </span>
      ))}
    </span>
  );

  return (
    <div ref={ref} aria-hidden={decorative || undefined} className="flex overflow-hidden whitespace-nowrap">
      <motion.div style={reduce ? undefined : { x, skewX: skew }} className={cn("flex", className)}>
        {copy}
        <span aria-hidden className="flex">
          {copy}
        </span>
      </motion.div>
    </div>
  );
}

const Star = () => (
  <svg viewBox="0 0 24 24" className="size-[0.42em] shrink-0 text-accent" aria-hidden>
    <path fill="currentColor" d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0Z" />
  </svg>
);

export function Statement() {
  return (
    <section aria-label="Summary" className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-subtle">
          <span className="size-1.5 rounded-full bg-accent" />
          In short
        </p>
        <ScrollLit text={summary} />
      </div>

      <div aria-label="Key outcomes" className="space-y-1 border-y border-line py-5 sm:py-7">
        <MarqueeRow
          speed={-2.2}
          items={outcomes.map((o) => ({
            key: o.value,
            node: (
              <>
                <span className="text-accent-text">{o.value}</span>{" "}
                <span className="font-serif text-[0.8em] font-normal italic tracking-[-0.01em] text-muted">{o.label}</span>
              </>
            ),
          }))}
          separator={<Star />}
          className="text-[clamp(2.4rem,6.5vw,5.5rem)] font-semibold leading-[1.05] tracking-[-0.045em]"
        />
        <MarqueeRow
          decorative
          speed={1.6}
          items={focus.map((f) => ({ key: f, node: f }))}
          separator={<span className="px-[0.2em] text-subtle">/</span>}
          className="font-serif text-transparent [-webkit-text-stroke:1px_var(--subtle)] text-[clamp(2.4rem,6.5vw,5.5rem)] italic leading-[1.05] tracking-[-0.02em]"
        />
      </div>
    </section>
  );
}
