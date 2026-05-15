import type { Prisma } from "@prisma/client";
import { DEFAULT_CLIENTS, DEFAULT_SERVICES } from "@/lib/default-catalog";
import { DEFAULT_PRODUCTS } from "@/lib/default-products";
import { getPrisma } from "@/lib/prisma";

function catalogEmpty(items: unknown): boolean {
  return !Array.isArray(items) || items.length === 0;
}

export async function ensureDefaultClientCatalog(): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;

  const row = await prisma.salonxClientCatalog.findUnique({ where: { id: "default" } });
  if (row && !catalogEmpty(row.items)) return false;

  const payload = [...DEFAULT_CLIENTS] as Prisma.InputJsonValue;
  await prisma.salonxClientCatalog.upsert({
    where: { id: "default" },
    create: { id: "default", items: payload },
    update: { items: payload },
  });
  return true;
}

export async function ensureDefaultServiceCatalog(): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;

  const row = await prisma.salonxServiceCatalog.findUnique({ where: { id: "default" } });
  if (row && !catalogEmpty(row.items)) return false;

  const payload = [...DEFAULT_SERVICES] as Prisma.InputJsonValue;
  await prisma.salonxServiceCatalog.upsert({
    where: { id: "default" },
    create: { id: "default", items: payload },
    update: { items: payload },
  });
  return true;
}

export async function ensureDefaultProductCatalog(): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;

  const row = await prisma.salonxProductCatalog.findUnique({ where: { id: "default" } });
  if (row && !catalogEmpty(row.items)) return false;

  const payload = [...DEFAULT_PRODUCTS] as Prisma.InputJsonValue;
  await prisma.salonxProductCatalog.upsert({
    where: { id: "default" },
    create: { id: "default", items: payload },
    update: { items: payload },
  });
  return true;
}
