"use client";

type Props = {
  open: boolean;
  slotLabel: string;
  mediaKind?: "image" | "video";
  onClose: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onNewUpload: () => void;
};

export function S1SlotMediaActionDialog({
  open,
  slotLabel,
  mediaKind = "image",
  onClose,
  onReplace,
  onRemove,
  onNewUpload,
}: Props) {
  if (!open) return null;

  const mediaLabel = mediaKind === "video" ? "video" : "image";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
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
        aria-label={`${slotLabel} — ${mediaLabel} options`}
        className="relative z-[1] w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-950 p-5 shadow-2xl"
      >
        <h2 className="text-base font-semibold text-zinc-50">{slotLabel}</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Choose what to do with this {mediaLabel} slot.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            onClick={onReplace}
          >
            Replace
          </button>
          <button
            type="button"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
            onClick={onNewUpload}
          >
            New upload
          </button>
          <button
            type="button"
            className="rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-950/70"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
