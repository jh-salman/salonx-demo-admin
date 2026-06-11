"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Pencil, Plus, X } from "lucide-react";
import { addStaffAction, updateStaffAction } from "@/app/actions/calendar-dashboard";
import type { DashboardCatalogStaff } from "@/lib/calendar-dashboard";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type State = { ok: true } | { ok: false; error: string } | null;

type StaffItemDialogProps = {
  mode: "add" | "edit";
  item?: DashboardCatalogStaff;
  trigger?: React.ReactNode;
};

export function StaffItemDialog({ mode, item, trigger }: StaffItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(item?.name ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setName(item?.name ?? "");
    setError(null);
    setSuccess(false);
  }, [open, item]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const fd = new FormData();
      fd.set("name", name);
      if (mode === "edit" && item?.id) fd.set("id", item.id);
      const result =
        mode === "add" ? await addStaffAction(fd) : await updateStaffAction(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setOpen(false), 600);
    } finally {
      setSubmitting(false);
    }
  }

  const defaultTrigger =
    mode === "add" ? (
      <Button type="button" variant="gradient" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add staff
      </Button>
    ) : (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Edit staff"
        onClick={() => setOpen(true)}
        className="text-[var(--fg-muted)] hover:text-[var(--fg-strong)]"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    );

  return (
    <>
      {trigger ? (
        <span role="presentation" onClick={() => setOpen(true)}>
          {trigger}
        </span>
      ) : (
        defaultTrigger
      )}
      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 m-auto w-[min(100%,24rem)] max-h-[90dvh] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-0 shadow-2xl backdrop:bg-black/50"
        onClose={() => setOpen(false)}
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--fg-strong)]">
              {mode === "add" ? "Add staff member" : "Edit staff member"}
            </h2>
            <button
              type="button"
              className="rounded-lg p-1 text-[var(--fg-muted)] hover:bg-[var(--surface-muted)]"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Appears as a column in the calendar day view.
          </p>
          <label className="mt-5 block">
            <Label className="mb-1.5 block">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cristi Curls"
              required
              autoFocus
            />
          </label>
          {error ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Saved
            </p>
          ) : null}
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={submitting}>
              {submitting ? "Saving…" : mode === "add" ? "Add" : "Save"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
