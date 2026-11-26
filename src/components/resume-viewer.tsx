"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { profile } from "@/data/resume";
import { ArrowUpRight, Close, Download, FileText } from "./icons";

const OPEN_EVENT = "open-resume";

/**
 * Opens the résumé. Phones can't reliably show a PDF inside the page,
 * so on small touch screens it opens in the browser's own PDF viewer instead.
 */
export function openResume() {
  const phone = window.matchMedia("(pointer: coarse) and (max-width: 767px)").matches;
  if (phone) window.open(profile.resumeUrl, "_blank", "noopener");
  else window.dispatchEvent(new Event(OPEN_EVENT));
}

export function ResumeViewer() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setLoaded(false);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // While open: freeze page scroll, close on Escape, and restore focus afterwards.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
      returnFocus.current?.focus();
    };
  }, [open, lenis, close]);

  const fileName = profile.resumeUrl.split("/").pop();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close résumé"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 cursor-default bg-bg/70 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${profile.name} résumé`}
            className="relative flex h-full max-h-[920px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-line-strong bg-elev shadow-[0_40px_120px_-30px_rgb(0_0_0/0.6)]"
            initial={{ opacity: 0, y: 40, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink">
                <FileText size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold tracking-tight">{profile.name} · Résumé</p>
                <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">{fileName}</p>
              </div>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-fg sm:inline-flex"
              >
                Open in new tab
                <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a
                href={profile.resumeUrl}
                download
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
              >
                <Download size={15} className="transition-transform group-hover:translate-y-0.5" />
                Download
              </a>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close résumé"
                className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
              >
                <Close size={18} />
              </button>
            </div>

            {/* Document */}
            <div data-lenis-prevent className="relative flex-1 bg-surface">
              {!loaded && (
                <div aria-hidden className="absolute inset-0 flex justify-center overflow-hidden p-6 sm:p-10">
                  <div className="w-full max-w-2xl space-y-4 rounded-lg bg-elev p-8 shadow-sm">
                    {[60, 35, 90, 82, 88, 70, 92, 85, 64, 90, 78].map((w, i) => (
                      <motion.div
                        key={i}
                        className="h-3 rounded-full bg-line-strong"
                        style={{ width: `${w}%` }}
                        animate={{ opacity: [0.35, 0.8, 0.35] }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.06 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <iframe
                src={`${profile.resumeUrl}#view=FitH`}
                title={`${profile.name} résumé (PDF)`}
                onLoad={() => setLoaded(true)}
                className="relative size-full border-0 transition-opacity duration-500"
                style={{ opacity: loaded ? 1 : 0 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
