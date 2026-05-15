"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, CheckCircle2, AlertCircle } from "lucide-react";
import { addProductAction } from "@/app/actions/calendar-dashboard";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

type State = { ok: true } | { ok: false; error: string } | null;

export function ProductAddDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: State, formData: FormData) => addProductAction(formData),
    null as State,
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      const t = setTimeout(() => setOpen(false), 700);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  return (
    <>
      <Button variant="gradient" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add product
      </Button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
        className="m-0 max-h-screen max-w-full bg-transparent p-0 backdrop:bg-zinc-950/60 backdrop:backdrop-blur-sm"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed left-1/2 top-1/2 w-[min(94vw,520px)] -translate-x-1/2 -translate-y-1/2 anim-in"
        >
          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--background)] p-6 shadow-2xl">
            <header className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-[var(--fg-strong)]">
                  New product
                </h3>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">
                  Adds to <code className="rounded bg-[var(--surface-muted)] px-1 text-xs">SalonxProductCatalog</code>{" "}
                  + emits realtime.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-lg text-[var(--fg-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--fg-strong)]"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <form action={formAction} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <Label className="mb-1.5 block">Brand</Label>
                  <Input name="brand" placeholder="e.g. ORIBE" autoFocus />
                </label>
                <label className="block">
                  <Label className="mb-1.5 block">Price ($)</Label>
                  <Input name="price" type="number" min="0" step="1" placeholder="49" />
                </label>
              </div>
              <label className="block">
                <Label className="mb-1.5 block">Product name *</Label>
                <Input name="name" required placeholder="Gold Lust Nourishing Oil" />
              </label>
              <label className="block">
                <Label className="mb-1.5 block">Image URL</Label>
                <Input
                  name="imageUrl"
                  type="url"
                  placeholder="https://…"
                />
              </label>
              <label className="block">
                <Label className="mb-1.5 block">Station tag</Label>
                <Select name="stationTag" defaultValue="">
                  <option value="">— None —</option>
                  <option value="BACK BAR">BACK BAR</option>
                  <option value="ON STATION">ON STATION</option>
                  <option value="RETAIL">RETAIL</option>
                </Select>
              </label>

              <div className="flex items-center justify-between gap-3 pt-2">
                {state && !state.ok ? (
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4" /> {state.error}
                  </p>
                ) : state?.ok ? (
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Saved.
                  </p>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" size="sm" disabled={pending}>
                    {pending ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Save product
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
