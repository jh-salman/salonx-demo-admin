"use client";

import type { S1MediaPickMode } from "@/lib/s1-demo-upload-history";

const MODE_LABELS: Record<S1MediaPickMode, string> = {
  replace: "Replace current image",
  newUpload: "Set slot image",
  addVariant: "Add another look",
};

type Props = {
  open: boolean;
  slotLabel: string;
  mode: S1MediaPickMode;
  historyCount: number;
  onClose: () => void;
  onPickGallery: () => void;
  onPickHistory: () => void;
};

export function S1MediaSourceDialog({
  open,
  slotLabel,
  mode,
  historyCount,
  onClose,
  onPickGallery,
  onPickHistory,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${slotLabel} — choose source`}
        className="relative z-[1] w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-950 p-5 shadow-2xl"
      >
        <h2 className="text-base font-semibold text-zinc-50">{slotLabel}</h2>
        <p className="mt-1 text-sm text-zinc-400">{MODE_LABELS[mode]}</p>
        <p className="mt-2 text-xs text-zinc-500">Choose where to pick the image from.</p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            onClick={onPickGallery}
          >
            Upload from gallery
          </button>
          <button
            type="button"
            disabled={historyCount === 0}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
            onClick={onPickHistory}
          >
            History &amp; memory
            {historyCount > 0 ? ` (${historyCount})` : ""}
          </button>
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200"
          onClick={onClose}
        >
          Back
        </button>
      </div>
    </div>
  );
}
