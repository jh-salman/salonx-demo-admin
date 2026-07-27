import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export class PayloadConflictError extends Error {
  constructor(
    message: string,
    public readonly updatedAt: string,
    public readonly payload: Record<string, unknown> | null,
  ) {
    super(message);
    this.name = "PayloadConflictError";
  }
}

// Prisma delegates vary by model id field — keep loose typing here.
type PayloadDelegate = {
  findUnique: (args: { where: Record<string, string> }) => Promise<{
    payload: unknown;
    updatedAt: Date;
  } | null>;
  upsert: (args: {
    where: Record<string, string>;
    create: Record<string, unknown>;
    update: { payload: Prisma.InputJsonValue };
  }) => Promise<{ payload: unknown; updatedAt: Date }>;
};

function asObject(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

export async function getPayloadRow(
  delegate: PayloadDelegate,
  idField: string,
  id: string,
) {
  const prisma = getPrisma();
  if (!prisma) {
    return { stored: false as const, payload: null as Record<string, unknown> | null };
  }
  const row = await delegate.findUnique({ where: { [idField]: id } });
  if (!row) {
    return { stored: false as const, payload: null as Record<string, unknown> | null };
  }
  return {
    stored: true as const,
    payload: asObject(row.payload),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function putPayloadRow(
  delegate: PayloadDelegate,
  idField: string,
  id: string,
  payload: unknown,
  expectedUpdatedAt?: string | null,
) {
  const prisma = getPrisma();
  if (!prisma) {
    throw new Error("DATABASE_URL is not configured");
  }
  const body = (asObject(payload) ?? {}) as Prisma.InputJsonValue;
  const expected = expectedUpdatedAt?.trim();
  if (expected) {
    const existing = await delegate.findUnique({ where: { [idField]: id } });
    if (existing && existing.updatedAt.toISOString() !== expected) {
      throw new PayloadConflictError(
        "Record was updated elsewhere",
        existing.updatedAt.toISOString(),
        asObject(existing.payload),
      );
    }
  }
  await delegate.upsert({
    where: { [idField]: id },
    create: { [idField]: id, payload: body },
    update: { payload: body },
  });
  return getPayloadRow(delegate, idField, id);
}
