"use client";

import { useSyncExternalStore } from "react";
import { profile } from "@/data/resume";

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: profile.timeZone,
  timeZoneName: "short",
});

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 10_000);
  return () => window.clearInterval(id);
}

/** Live local time for the profile's time zone (client only, no hydration mismatch). */
export function LocalTime() {
  const time = useSyncExternalStore(
    subscribe,
    () => timeFmt.format(new Date()),
    () => "",
  );
  return <span className="tabular-nums">{time || "--:--"}</span>;
}

export function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => 2026,
  );
  return <>{year}</>;
}
