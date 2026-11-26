"use client";

import { useRef, useSyncExternalStore } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { experience, type Experience as Job } from "@/data/resume";
import { EASE_OUT } from "@/lib/utils";
import { SectionHeading } from "../ui/section-heading";
import { RichText, SpotlightCard } from "../ui/motion-primitives";

const DESKTOP = "(min-width: 1024px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useDesktop = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  );

function JobCard({
  job,
  i,
  n,
  progress,
  stack,
}: {
  job: Job;
  i: number;
  n: number;
  progress: MotionValue<number>;
  stack: boolean;
}) {
  // As later cards slide over, earlier ones recede: shrink, dim and tip back.
  const start = i / n;
  const scale = useTransform(progress, [start, 1], [1, 1 - (n - 1 - i) * 0.05]);
  const dim = useTransform(progress, [start, 1], [0, (n - 1 - i) * 0.32]);
  const rotateX = useTransform(progress, [start, 1], [0, (n - 1 - i) * 4]);

  return (
    <div
      className="lg:sticky"
      style={stack ? { top: `calc(6.5rem + ${i * 2.25}rem)` } : undefined}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1, ease: EASE_OUT }}
      >
        <motion.div
          style={stack ? { scale, rotateX, transformPerspective: 1600, transformOrigin: "50% 0%" } : undefined}
          className="relative"
        >
          <SpotlightCard className="group bg-elev p-6 shadow-[0_-20px_60px_-30px_rgb(0_0_0/0.45)] sm:p-9">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-subtle">
                    {job.period} · {job.location}
                  </p>
                  <span
                    aria-hidden
                    className="font-serif text-6xl italic leading-[0.7] text-transparent transition-colors duration-500 [-webkit-text-stroke:1px_var(--line-strong)] group-hover:[-webkit-text-stroke:1px_var(--accent)]"
                  >
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{job.company}</h3>
                <p className="font-serif text-xl italic text-muted sm:text-2xl">{job.role}</p>

                <dl className="mt-8 grid grid-cols-2 gap-6 lg:mt-auto lg:pt-10">
                  {job.headlines.map((h) => (
                    <div key={h.label} className="flex flex-col-reverse">
                      <dt className="mt-1 font-mono text-[11px] uppercase leading-snug tracking-[0.14em] text-subtle">{h.label}</dt>
                      <dd className="text-4xl font-semibold tracking-[-0.05em] text-accent-text sm:text-5xl">{h.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <ul className="space-y-3 border-line lg:border-l lg:pl-10">
                {job.highlights.map((h, k) => (
                  <motion.li
                    key={h}
                    initial={{ opacity: 0, x: 24, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                    transition={{ duration: 0.7, delay: 0.15 + k * 0.08, ease: EASE_OUT }}
                    className="relative pl-5 text-pretty leading-relaxed text-muted"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-[0.72em] h-px w-2.5 bg-accent transition-[width] duration-500 group-hover:w-3.5"
                    />
                    <RichText text={h} />
                  </motion.li>
                ))}
              </ul>
            </div>
          </SpotlightCard>
          {/* Dimming veil for cards that have been stacked over */}
          {stack && (
            <motion.div
              aria-hidden
              style={{ opacity: dim }}
              className="pointer-events-none absolute inset-0 rounded-3xl bg-bg"
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export function Experience() {
  const listRef = useRef<HTMLDivElement>(null);
  const desktop = useDesktop();
  const reduce = useReducedMotion();
  const stack = desktop && !reduce;
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start start", "end end"] });

  return (
    <section id="experience" className="relative border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading index="02" label="Experience" title="Where I've *shipped.*" />

        <div ref={listRef} className="mt-10 flex flex-col gap-5 lg:gap-[14vh]">
          {experience.map((job, i) => (
            <JobCard key={job.company} job={job} i={i} n={experience.length} progress={scrollYProgress} stack={stack} />
          ))}
        </div>
      </div>
    </section>
  );
}
