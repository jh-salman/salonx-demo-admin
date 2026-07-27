"use client";

import { slotImageTransform } from "@/lib/s1-slot-geometry";
import type { S1DemoSlotAdjust } from "@/lib/salonx-config";

export type S1MediaThumbPreview = {
  url: string;
  kind: "image" | "video";
  adjust?: S1DemoSlotAdjust;
};

type Props = {
  preview: S1MediaThumbPreview;
  active?: boolean;
  label: string;
  onClick?: () => void;
};

export function S1MediaThumb({ preview, active, label, onClick }: Props) {
  const fit = preview.adjust?.fit ?? "cover";
  const transform = preview.adjust ? slotImageTransform(preview.adjust) : undefined;
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-zinc-950 transition ${
        onClick ? "cursor-pointer" : ""
      } ${
        active
          ? "border-blue-500 ring-2 ring-blue-500/35"
          : onClick
            ? "border-zinc-700 hover:border-zinc-500"
            : "border-zinc-700"
      }`}
      onClick={onClick}
      aria-label={onClick ? label : undefined}
      aria-pressed={onClick ? active : undefined}
    >
      <div className="absolute inset-0 overflow-hidden">
        {preview.kind === "video" ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={preview.url}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full"
            style={{
              objectFit: fit,
              transform,
              transformOrigin: "center center",
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview.url}
            alt=""
            className="h-full w-full"
            style={{
              objectFit: fit,
              transform,
              transformOrigin: "center center",
            }}
          />
        )}
      </div>
      {active ? (
        <span className="absolute left-1.5 top-1.5 rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
          Live
        </span>
      ) : null}
      {preview.kind === "video" ? (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
          Video
        </span>
      ) : null}
    </Tag>
  );
}
