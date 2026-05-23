"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Pencil, Plus, Upload, X } from "lucide-react";
import {
  addProductAction,
  addServiceAction,
  updateProductAction,
  updateServiceAction,
} from "@/app/actions/calendar-dashboard";
import { uploadToCloudinaryFromBrowser } from "@/lib/cloudinary-browser-upload";
import type {
  DashboardCatalogProduct,
  DashboardCatalogService,
} from "@/lib/calendar-dashboard";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

type CatalogKind = "product" | "service";
type ImageMode = "upload" | "url";

type State = { ok: true } | { ok: false; error: string } | null;

type CatalogItemDialogProps =
  | {
      kind: "product";
      mode: "add" | "edit";
      item?: DashboardCatalogProduct;
      trigger?: React.ReactNode;
    }
  | {
      kind: "service";
      mode: "add" | "edit";
      item?: DashboardCatalogService;
      trigger?: React.ReactNode;
    };

function productImage(item?: DashboardCatalogProduct) {
  return item?.imageUrl?.trim() || "";
}

function serviceImage(item?: DashboardCatalogService) {
  return item?.image?.trim() || "";
}

type FormState = {
  name: string;
  brand: string;
  price: string;
  stationTag: string;
  color: string;
};

function buildFormState(
  kind: CatalogKind,
  item?: DashboardCatalogProduct | DashboardCatalogService,
): FormState {
  if (kind === "product") {
    const product = item as DashboardCatalogProduct | undefined;
    return {
      name: product?.name ?? "",
      brand: product?.brand ?? "",
      price: typeof product?.price === "number" ? String(product.price) : "",
      stationTag: product?.stationTag ?? "",
      color: product?.color ?? "#1a1612",
    };
  }

  const service = item as DashboardCatalogService | undefined;
  return {
    name: service?.name ?? "",
    brand: "",
    price: typeof service?.price === "number" ? String(service.price) : "",
    stationTag: "",
    color: "#1a1612",
  };
}

export function CatalogItemDialog(props: CatalogItemDialogProps) {
  const { kind, mode, item, trigger } = props;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initialImage = kind === "product" ? productImage(item) : serviceImage(item);
  const [form, setForm] = useState<FormState>(() => buildFormState(kind, item));
  const [imageMode, setImageMode] = useState<ImageMode>(initialImage ? "url" : "upload");
  const [imageUrl, setImageUrl] = useState(initialImage || "");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
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
    const img = kind === "product" ? productImage(item) : serviceImage(item);
    setForm(buildFormState(kind, item));
    setImageMode(img ? "url" : "upload");
    setImageUrl(img || "");
    setUploadFile(null);
    setPreviewUrl(img || null);
    setError(null);
    setSuccess(false);
    if (fileRef.current) fileRef.current.value = "";
  }, [open, kind, item]);

  useEffect(() => {
    if (!uploadFile) return;
    const url = URL.createObjectURL(uploadFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadFile]);

  const title =
    mode === "add"
      ? kind === "product"
        ? "New product"
        : "New service"
      : kind === "product"
        ? "Edit product"
        : "Edit service";

  async function resolveImageUrl(): Promise<string> {
    const url = imageUrl ?? "";
    if (imageMode === "url") return url.trim();
    if (!uploadFile) return url.trim();
    try {
      return await uploadToCloudinaryFromBrowser(uploadFile, "image");
    } catch {
      throw new Error("Image upload failed — check Cloudinary config or use a URL");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const formEl = e.currentTarget;
      const fd = new FormData(formEl);
      const resolvedImage = await resolveImageUrl();
      fd.set(kind === "product" ? "imageUrl" : "image", resolvedImage);

      let result: State = null;
      if (kind === "product") {
        result =
          mode === "add"
            ? await addProductAction(fd)
            : await updateProductAction(fd);
      } else {
        result =
          mode === "add" ? await addServiceAction(fd) : await updateServiceAction(fd);
      }

      if (!result?.ok) {
        setError(result && !result.ok ? result.error : "Save failed");
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setOpen(false), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  const defaultTrigger =
    mode === "add" ? (
      <Button variant="gradient" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add {kind}
      </Button>
    ) : (
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Edit ${kind}`}
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
                  {title}
                </h3>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">
                  Image: upload a file or paste a URL.
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

            <form
              key={`${mode}-${kind}-${item?.id ?? "new"}`}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === "edit" && item?.id ? (
                <input type="hidden" name="id" value={item.id} />
              ) : null}

              {kind === "product" ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <Label className="mb-1.5 block">Brand</Label>
                      <Input
                        name="brand"
                        value={form.brand}
                        onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                        placeholder="e.g. ORIBE"
                      />
                    </label>
                    <label className="block">
                      <Label className="mb-1.5 block">Price ($)</Label>
                      <Input
                        name="price"
                        type="number"
                        min="0"
                        step="1"
                        value={form.price}
                        onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                        placeholder="49"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <Label className="mb-1.5 block">Product name *</Label>
                    <Input
                      name="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Gold Lust Nourishing Oil"
                    />
                  </label>
                  <label className="block">
                    <Label className="mb-1.5 block">Station tag</Label>
                    <Select
                      name="stationTag"
                      value={form.stationTag}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, stationTag: e.target.value }))
                      }
                    >
                      <option value="">— None —</option>
                      <option value="BACK BAR">BACK BAR</option>
                      <option value="ON STATION">ON STATION</option>
                      <option value="RETAIL">RETAIL</option>
                    </Select>
                  </label>
                  <input type="hidden" name="color" value={form.color} />
                </>
              ) : (
                <>
                  <label className="block">
                    <Label className="mb-1.5 block">Service name *</Label>
                    <Input
                      name="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Women's Haircut"
                      autoFocus
                    />
                  </label>
                  <label className="block">
                    <Label className="mb-1.5 block">Price ($)</Label>
                    <Input
                      name="price"
                      type="number"
                      min="0"
                      step="1"
                      value={form.price}
                      onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="65"
                    />
                  </label>
                </>
              )}

              <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      imageMode === "upload"
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg-strong)]"
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      imageMode === "url"
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg-strong)]"
                    }`}
                  >
                    URL
                  </button>
                </div>

                {imageMode === "upload" ? (
                  <label className="block">
                    <Label className="mb-1.5 block">Image file</Label>
                    <Input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setUploadFile(f);
                      }}
                    />
                  </label>
                ) : (
                  <label className="block">
                    <Label className="mb-1.5 block">Image URL</Label>
                    <Input
                      type="url"
                      value={imageUrl ?? ""}
                      onChange={(e) => {
                        const next = e.target.value;
                        setImageUrl(next);
                        setPreviewUrl(next.trim() || null);
                      }}
                      placeholder="https://…"
                    />
                  </label>
                )}

                {previewUrl ? (
                  <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt=""
                      className="mx-auto max-h-32 w-full object-contain p-2"
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                {error ? (
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </p>
                ) : success ? (
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
                  <Button type="submit" variant="gradient" size="sm" disabled={submitting}>
                    {submitting ? "Saving…" : mode === "add" ? "Add" : "Update"}
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
