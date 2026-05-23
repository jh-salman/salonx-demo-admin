import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { salonxApiOrigin } from "@/lib/salonx-api-url";

export type CatalogResult = { ok: true } | { ok: false; error: string };

export type ServiceCatalogInput = {
  id?: string;
  name: string;
  price?: number;
  image?: string;
  kind?: string;
};

export type ProductCatalogInput = {
  id?: string;
  name: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
  color?: string;
  stationTag?: string;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function newCatalogId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

async function demoApiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const origin = salonxApiOrigin();
  if (!origin) return null;
  const url = `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type ProductCatalogResponse = {
  products?: unknown[];
  updatedAt?: string;
};

type ServiceCatalogResponse = {
  serviceCatalog?: unknown[];
  updatedAt?: string;
};

async function loadProducts(): Promise<{ items: unknown[]; updatedAt?: string }> {
  if (salonxApiOrigin()) {
    const current = await demoApiFetch<ProductCatalogResponse>("/api/product-catalog");
    return {
      items: Array.isArray(current?.products) ? [...current!.products] : [],
      updatedAt: current?.updatedAt,
    };
  }
  const prisma = getPrisma();
  if (!prisma) return { items: [] };
  const row = await prisma.salonxProductCatalog.findUnique({ where: { id: "default" } });
  return {
    items: Array.isArray(row?.items) ? [...(row.items as unknown[])] : [],
    updatedAt: row?.updatedAt?.toISOString(),
  };
}

async function saveProducts(
  products: unknown[],
  expectedUpdatedAt?: string,
): Promise<CatalogResult> {
  if (salonxApiOrigin()) {
    const putRes = await demoApiFetch<ProductCatalogResponse>("/api/product-catalog", {
      method: "PUT",
      body: JSON.stringify({
        products,
        ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}),
      }),
    });
    if (!putRes) return { ok: false, error: "Could not save product catalog" };
    return { ok: true };
  }
  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: "DATABASE_URL is not configured" };
  await prisma.salonxProductCatalog.upsert({
    where: { id: "default" },
    create: { id: "default", items: products as Prisma.InputJsonValue },
    update: { items: products as Prisma.InputJsonValue },
  });
  return { ok: true };
}

async function loadServices(): Promise<{ items: unknown[]; updatedAt?: string }> {
  if (salonxApiOrigin()) {
    const current = await demoApiFetch<ServiceCatalogResponse>("/api/service-catalog");
    return {
      items: Array.isArray(current?.serviceCatalog) ? [...current!.serviceCatalog] : [],
      updatedAt: current?.updatedAt,
    };
  }
  const prisma = getPrisma();
  if (!prisma) return { items: [] };
  const row = await prisma.salonxServiceCatalog.findUnique({ where: { id: "default" } });
  return {
    items: Array.isArray(row?.items) ? [...(row.items as unknown[])] : [],
    updatedAt: row?.updatedAt?.toISOString(),
  };
}

async function saveServices(
  serviceCatalog: unknown[],
  expectedUpdatedAt?: string,
): Promise<CatalogResult> {
  if (salonxApiOrigin()) {
    const putRes = await demoApiFetch<ServiceCatalogResponse>("/api/service-catalog", {
      method: "PUT",
      body: JSON.stringify({
        serviceCatalog,
        ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}),
      }),
    });
    if (!putRes) return { ok: false, error: "Could not save service catalog" };
    return { ok: true };
  }
  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: "DATABASE_URL is not configured" };
  await prisma.salonxServiceCatalog.upsert({
    where: { id: "default" },
    create: { id: "default", items: serviceCatalog as Prisma.InputJsonValue },
    update: { items: serviceCatalog as Prisma.InputJsonValue },
  });
  return { ok: true };
}

function normalizeProductInput(input: ProductCatalogInput): ProductCatalogInput | null {
  const name = input.name?.trim();
  if (!name) return null;
  return {
    id: input.id?.trim() || undefined,
    name,
    brand: input.brand?.trim() || undefined,
    price: typeof input.price === "number" && !Number.isNaN(input.price) ? input.price : undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    color: input.color?.trim() || undefined,
    stationTag: input.stationTag?.trim() || undefined,
  };
}

function normalizeServiceInput(input: ServiceCatalogInput): ServiceCatalogInput | null {
  const name = input.name?.trim();
  if (!name) return null;
  return {
    id: input.id?.trim() || undefined,
    name,
    price: typeof input.price === "number" && !Number.isNaN(input.price) ? input.price : undefined,
    image: input.image?.trim() || undefined,
    kind: input.kind?.trim() || undefined,
  };
}

export async function addProductFromAdmin(input: ProductCatalogInput): Promise<CatalogResult> {
  const product = normalizeProductInput(input);
  if (!product) return { ok: false, error: "Product name is required" };
  const { items, updatedAt } = await loadProducts();
  items.push({ id: newCatalogId("prod"), ...product });
  return saveProducts(items, updatedAt);
}

export async function updateProductFromAdmin(input: ProductCatalogInput): Promise<CatalogResult> {
  const id = input.id?.trim();
  if (!id) return { ok: false, error: "Missing product id" };
  const product = normalizeProductInput(input);
  if (!product) return { ok: false, error: "Product name is required" };
  const { items, updatedAt } = await loadProducts();
  let found = false;
  const next = items.map((raw) => {
    const o = asRecord(raw);
    if (!o || o.id !== id) return raw;
    found = true;
    return { ...o, ...product, id };
  });
  if (!found) return { ok: false, error: "Product not found" };
  return saveProducts(next, updatedAt);
}

export async function deleteProductFromAdmin(id: string): Promise<CatalogResult> {
  const target = id.trim();
  if (!target) return { ok: false, error: "Missing product id" };
  const { items, updatedAt } = await loadProducts();
  const next = items.filter((raw) => {
    const o = asRecord(raw);
    return !o || o.id !== target;
  });
  if (next.length === items.length) return { ok: false, error: "Product not found" };
  return saveProducts(next, updatedAt);
}

export async function addServiceFromAdmin(input: ServiceCatalogInput): Promise<CatalogResult> {
  const service = normalizeServiceInput(input);
  if (!service) return { ok: false, error: "Service name is required" };
  const { items, updatedAt } = await loadServices();
  items.push({ id: newCatalogId("svc"), ...service });
  return saveServices(items, updatedAt);
}

export async function updateServiceFromAdmin(input: ServiceCatalogInput): Promise<CatalogResult> {
  const id = input.id?.trim();
  if (!id) return { ok: false, error: "Missing service id" };
  const service = normalizeServiceInput(input);
  if (!service) return { ok: false, error: "Service name is required" };
  const { items, updatedAt } = await loadServices();
  let found = false;
  const next = items.map((raw) => {
    const o = asRecord(raw);
    if (!o || o.id !== id) return raw;
    found = true;
    return { ...o, ...service, id };
  });
  if (!found) return { ok: false, error: "Service not found" };
  return saveServices(next, updatedAt);
}

export async function deleteServiceFromAdmin(id: string): Promise<CatalogResult> {
  const target = id.trim();
  if (!target) return { ok: false, error: "Missing service id" };
  const { items, updatedAt } = await loadServices();
  const next = items.filter((raw) => {
    const o = asRecord(raw);
    return !o || o.id !== target;
  });
  if (next.length === items.length) return { ok: false, error: "Service not found" };
  return saveServices(next, updatedAt);
}
