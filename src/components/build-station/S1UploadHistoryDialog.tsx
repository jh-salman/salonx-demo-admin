"use client";

import { S1MediaThumb } from "@/components/build-station/S1MediaThumb";
import type { S1DemoUploadHistoryItem } from "@/lib/s1-demo-upload-history";
import { MAX_S1_SLOT_UPLOAD_HISTORY, type S1MediaPickMode } from "@/lib/s1-demo-upload-history";

const MODE_LABELS: Record<S1MediaPickMode, string> = {
  replace: "Replace with a saved upload",
  newUpload: "Choose a saved upload",
  addVariant: "Add from memory",
};

type Props = {
  open: boolean;
  slotLabel: string;
  mode: S1MediaPickMode;
  items: S1DemoUploadHistoryItem[];
  activeUrl?: string;
  onClose: () => void;
  onSelect: (item: S1DemoUploadHistoryItem) => void;
};

export function S1UploadHistoryDialog({
  open,
  slotLabel,
  mode,
  items,
  activeUrl,
  onClose,
  onSelect,
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
        aria-label={`${slotLabel} — upload history`}
        className="relative z-[1] flex max-h-[min(90vh,640px)] w-full max-w-sm flex-col rounded-2xl border border-zinc-700 bg-zinc-950 p-5 shadow-2xl"
      >
        <h2 className="text-base font-semibold text-zinc-50">History &amp; memory</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {slotLabel} · {MODE_LABELS[mode]}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {items.length} saved · up to {MAX_S1_SLOT_UPLOAD_HISTORY} per slot
        </p>

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">No uploads saved for this slot yet.</p>
        ) : (
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-2">
              {items.map((item) => {
                const active = Boolean(activeUrl && item.url === activeUrl);
                return (
                  <S1MediaThumb
                    key={item.id}
                    preview={{
                      url: item.url,
                      kind: item.kind,
                      adjust: item.adjust,
                    }}
                    active={active}
                    label={`Saved upload${active ? ", currently live" : ""}`}
                    onClick={() => onSelect(item)}
                  />
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          className="mt-4 w-full shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200"
          onClick={onClose}
        >
          Back
        </button>
      </div>
    </div>
  );
}
