import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RTF_OPTIONS: Intl.RelativeTimeFormatOptions = { numeric: "auto" };
const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

export function formatRelative(iso: string, locale: string | undefined = undefined): string {
  try {
    const ms = new Date(iso).getTime() - Date.now();
    if (Number.isNaN(ms)) return iso;
    const rtf = new Intl.RelativeTimeFormat(locale, RTF_OPTIONS);
    let duration = ms / 1000;
    for (const division of DIVISIONS) {
      if (Math.abs(duration) < division.amount) {
        return rtf.format(Math.round(duration), division.unit);
      }
      duration /= division.amount;
    }
    return iso;
  } catch {
    return iso;
  }
}

export function initialsFrom(name: string): string {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const PALETTE = [
  "linear-gradient(135deg,#6366f1 0%,#a855f7 100%)",
  "linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)",
  "linear-gradient(135deg,#0ea5e9 0%,#10b981 100%)",
  "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)",
  "linear-gradient(135deg,#06b6d4 0%,#6366f1 100%)",
  "linear-gradient(135deg,#84cc16 0%,#0ea5e9 100%)",
  "linear-gradient(135deg,#f43f5e 0%,#a855f7 100%)",
];

/** Stable gradient for a given seed (e.g. client name). */
export function gradientForSeed(seed: string): string {
  let h = 0;
  const s = (seed || "").toLowerCase();
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  }
  return PALETTE[Math.abs(h) % PALETTE.length];
}
