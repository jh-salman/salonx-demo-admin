"use client";

import * as React from "react";
import { cn, gradientForSeed, initialsFrom } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = 40,
  className,
  rounded = "rounded-full",
  ringed = true,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  rounded?: string;
  ringed?: boolean;
}) {
  const [errored, setErrored] = React.useState(false);
  const showImg = src && !errored;
  const initials = initialsFrom(name);
  const gradient = gradientForSeed(name);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden text-[11px] font-bold tracking-wide text-white shadow-sm",
        rounded,
        ringed && "ring-2 ring-white dark:ring-zinc-900",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: showImg ? "var(--surface-muted)" : gradient,
      }}
      aria-hidden
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          draggable={false}
          onError={() => setErrored(true)}
        />
      ) : (
        <span style={{ fontSize: Math.max(10, size * 0.34) }}>{initials || "?"}</span>
      )}
    </span>
  );
}
