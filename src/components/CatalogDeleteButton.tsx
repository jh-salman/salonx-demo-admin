"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  deleteProductAction,
  deleteServiceAction,
  deleteStaffAction,
} from "@/app/actions/calendar-dashboard";
import { Button } from "@/components/ui/button";

export function CatalogDeleteButton({
  kind,
  id,
  label,
}: {
  kind: "product" | "service" | "staff";
  id: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (pending) return;
    const msg =
      kind === "product"
        ? `Delete product “${label}”?`
        : kind === "service"
          ? `Delete service “${label}”?`
          : `Remove staff “${label}”?`;
    if (!window.confirm(msg)) return;
    setPending(true);
    try {
      const result =
        kind === "product"
          ? await deleteProductAction(id)
          : kind === "service"
            ? await deleteServiceAction(id)
            : await deleteStaffAction(id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Delete ${kind}`}
      disabled={pending}
      onClick={() => void handleDelete()}
      className="text-[var(--fg-muted)] hover:text-rose-600 dark:hover:text-rose-400"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
