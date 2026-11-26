"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useLenis } from "lenis/react";
import { profile } from "@/data/resume";
import { cn, EASE_OUT } from "@/lib/utils";
import { introDelay } from "@/lib/intro";
import { RollText } from "./ui/motion-primitives";
import { ThemeToggle } from "./theme-toggle";
import { ArrowUpRight, Close, Menu } from "./icons";

const links = [
  { id: "impact", label: "Impact" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [D] = useState(introDelay);
  const lenis = useLenis();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.3 });

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  // Track the section currently crossing the middle of the viewport.
  useEffect(() => {
    const els = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const top = new IntersectionObserver(([e]) => e.isIntersecting && setActive(null), {
      rootMargin: "0px 0px -60% 0px",
    });
    const hero = document.getElementById("top");
    if (hero) top.observe(hero);
    return () => {
      io.disconnect();
      top.disconnect();
    };
  }, []);

  // Lock scroll while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    const target = id === "top" ? 0 : `#${id}`;
    requestAnimationFrame(() => {
      if (lenis) lenis.scrollTo(target, { force: true, duration: 1.4 });
      else if (id === "top") window.scrollTo({ top: 0 });
      else document.getElementById(id)?.scrollIntoView();
      history.replaceState(null, "", id === "top" ? location.pathname + location.search : `#${id}`);
    });
  };

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-accent"
      />
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: D + 0.6, ease: EASE_OUT }}
        className="fixed inset-x-0 top-0 z-[60]"
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[padding] duration-500 sm:px-6",
            scrolled ? "pt-3" : "pt-5",
          )}
        >
          <a
            href="#top"
            onClick={goTo("top")}
            className="group flex items-center gap-3 rounded-full"
            aria-label={`${profile.name}, back to top`}
          >
            <span className="relative grid size-10 place-items-center rounded-full border border-line bg-elev/70 font-mono text-[13px] font-medium tracking-tight backdrop-blur-xl transition-colors group-hover:border-accent">
              {profile.initials}
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-bg bg-accent" />
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium tracking-tight transition-opacity duration-500 lg:block",
                scrolled ? "opacity-0" : "opacity-100",
              )}
            >
              {profile.name}
            </span>
          </a>

          <nav
            aria-label="Primary"
            className="hidden items-center rounded-full border border-line bg-elev/70 p-1 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.35)] backdrop-blur-xl md:flex"
          >
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={goTo(l.id)}
                aria-current={active === l.id ? "true" : undefined}
                className={cn(
                  "group relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-300",
                  active === l.id ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {active === l.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full border border-line bg-surface"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <RollText>{l.label}</RollText>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="#contact"
              onClick={goTo("contact")}
              className="group hidden items-center gap-1.5 rounded-full bg-fg px-4 py-2.5 text-[13px] font-medium text-bg transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              <RollText>Let&apos;s talk</RollText>
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-full border border-line bg-elev/70 backdrop-blur-xl md:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="fixed inset-0 z-[80] flex flex-col bg-bg px-6 pb-10 pt-5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full border border-line"
              >
                <Close size={18} />
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-14 flex flex-col">
              {links.map((l, i) => (
                <motion.a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={goTo(l.id)}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: EASE_OUT }}
                  className="flex items-baseline gap-4 border-b border-line py-4 text-4xl font-semibold tracking-tight"
                >
                  <span className="font-mono text-xs font-normal text-accent-text">0{i + 1}</span>
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-auto flex flex-col gap-1 font-mono text-sm text-muted"
            >
              <a href={`mailto:${profile.email}`} className="text-fg">
                {profile.email}
              </a>
              <span>{profile.location}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
