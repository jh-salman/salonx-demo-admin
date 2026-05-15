import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

const MAX_ITEMS = 500;

export function asJsonArray(v: unknown, max = MAX_ITEMS): unknown[] {
  return Array.isArray(v) ? v.slice(0, max) : [];
}

export class CatalogConflictError extends Error {
  constructor(
    message: string,
    public readonly updatedAt: string,
    public readonly items: unknown[],
  ) {
    super(message);
    this.name = "CatalogConflictError";
  }
}

type CatalogDelegate = {
  findUnique: (args: { where: { id: string } }) => Promise<{
    items: unknown;
    updatedAt: Date;
  } | null>;
  upsert: (args: {
    where: { id: string };
    create: { id: string; items: Prisma.InputJsonValue };
    update: { items: Prisma.InputJsonValue };
  }) => Promise<{ items: unknown; updatedAt: Date }>;
};

export async function getCatalogRow(delegate: CatalogDelegate) {
  const prisma = getPrisma();
  if (!prisma) {
    return { stored: false as const, items: [] as unknown[] };
  }
  const row = await delegate.findUnique({ where: { id: "default" } });
  if (!row) {
    return { stored: false as const, items: [] as unknown[] };
  }
  return {
    stored: true as const,
    items: row.items as unknown[],
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function putCatalogRow(
  delegate: CatalogDelegate,
  items: unknown,
  expectedUpdatedAt?: string | null,
) {
  const prisma = getPrisma();
  if (!prisma) {
    throw new Error("DATABASE_URL is not configured");
  }
  const payload = asJsonArray(items) as Prisma.InputJsonValue;
  const expected = expectedUpdatedAt?.trim();
  if (expected) {
    const existing = await delegate.findUnique({ where: { id: "default" } });
    if (existing && existing.updatedAt.toISOString() !== expected) {
      throw new CatalogConflictError(
        "Catalog was updated elsewhere",
        existing.updatedAt.toISOString(),
        existing.items as unknown[],
      );
    }
  }
  await delegate.upsert({
    where: { id: "default" },
    create: { id: "default", items: payload },
    update: { items: payload },
  });
  return getCatalogRow(delegate);
}
