"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, stagger, useInView, useReducedMotion } from "motion/react";
import { profile } from "@/data/resume";
import { ArrowUp, ArrowUpRight, Check, Copy, Download, Mail, MapPin, Phone, Spark } from "../icons";
import { openChat } from "../chat/chat-widget";
import { CurrentYear, LocalTime } from "../ui/client-clock";
import { Magnetic, Reveal, RollText, SplitWords } from "../ui/motion-primitives";
import { EASE_OUT } from "@/lib/utils";

const WORDS = ["reliable.", "scalable.", "intelligent.", "secure."];

/** Cycles the closing word letter by letter while the heading is on screen. */
function RotatingWord() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % WORDS.length), 2600);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  return (
    <span ref={ref} className="relative inline-block whitespace-nowrap">
      <span className="sr-only">{WORDS[0]}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={WORDS[i]}
          aria-hidden
          className="inline-flex font-serif text-[1.08em] font-normal italic tracking-[-0.01em] text-accent-text"
          initial="hidden"
          animate="show"
          exit="exit"
          variants={{
            hidden: {},
            show: { transition: { delayChildren: stagger(0.035) } },
            exit: { transition: { delayChildren: stagger(0.02) } },
          }}
        >
          {WORDS[i].split("").map((ch, k) => (
            <span key={k} className="-mb-[0.2em] -mr-[0.05em] inline-block overflow-hidden pb-[0.2em] pr-[0.05em]">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "110%", rotate: 8 },
                  show: { y: "0%", rotate: 0, transition: { duration: 0.6, ease: EASE_OUT } },
                  exit: { y: "-110%", rotate: -8, transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] } },
                }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-muted transition-colors hover:border-fg hover:text-fg"
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "y" : "n"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center gap-2"
        >
          {copied ? <Check size={15} className="text-accent-text" /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy email"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Contact() {
  const rows = [
    { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: "Phone", value: profile.phone, href: profile.phoneHref },
    { icon: MapPin, label: "Location", value: profile.location },
  ];

  return (
    <section id="contact" className="relative isolate overflow-hidden border-t border-line">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/10 blur-[150px]" />
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 pt-20 sm:px-8 sm:pt-28">
        <Reveal y={12} blur={false}>
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-subtle">
            <span className="text-accent-text">04</span>
            <span className="h-px w-8 bg-line-strong" />
            Contact
          </p>
        </Reveal>

        <h2 className="mt-4 max-w-4xl text-balance text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          <SplitWords text="Let's build something" interval={0.07} /> <RotatingWord />
        </h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <Reveal>
            <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted sm:text-xl">
              Bringing AI into an enterprise stack? I&apos;d love to hear about it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href={`mailto:${profile.email}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink shadow-[0_10px_40px_-10px_var(--accent)]"
                >
                  <RollText>Start a conversation</RollText>
                  <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Magnetic>
              <CopyEmail />
              <button
                type="button"
                onClick={() => openChat()}
                className="group inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-fg"
              >
                <Spark size={15} className="text-accent-text transition-transform duration-500 group-hover:rotate-90" />
                Ask my AI
              </button>
              <a
                href={profile.resumeUrl}
                download
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
              >
                <Download size={15} /> Résumé (PDF)
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-elev/70 backdrop-blur">
              {rows.map(({ icon: Icon, label, value, href }) => {
                const inner = (
                  <>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors group-hover:border-accent group-hover:text-accent-text">
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10.5px] uppercase tracking-[0.16em] text-subtle">{label}</span>
                      <span className="block truncate font-medium">{value}</span>
                    </span>
                    {href && (
                      <ArrowUpRight
                        size={16}
                        className="text-subtle transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                      />
                    )}
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface/60"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="group flex items-center gap-4 px-5 py-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto mt-20 max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 border-t border-line py-8 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle md:flex-row md:items-center md:justify-between">
          <span>
            © <CurrentYear />
          </span>
          <span>
            {profile.location} · <LocalTime />
          </span>
          <span className="hidden lg:block">Next.js 16 · React 19 · Tailwind CSS 4 · Motion</span>
          <a href="#top" className="inline-flex items-center gap-2 transition-colors hover:text-fg">
            Back to top <ArrowUp size={13} />
          </a>
        </div>
      </footer>
    </section>
  );
}
