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

function repairCatalogIds(items: unknown[], prefix: string): unknown[] {
  return items.map((raw) => {
    const o = asRecord(raw);
    if (!o) return raw;
    const id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : "";
    if (id) return raw;
    return { ...o, id: newCatalogId(prefix) };
  });
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

function normalizeProductInput(input: ProductCatalogInput): Omit<ProductCatalogInput, "id"> & { id?: string } | null {
  const name = input.name?.trim();
  if (!name) return null;
  const out: Omit<ProductCatalogInput, "id"> & { id?: string } = {
    name,
    brand: input.brand?.trim() || undefined,
    price: typeof input.price === "number" && !Number.isNaN(input.price) ? input.price : undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    color: input.color?.trim() || undefined,
    stationTag: input.stationTag?.trim() || undefined,
  };
  const id = input.id?.trim();
  if (id) out.id = id;
  return out;
}

function normalizeServiceInput(input: ServiceCatalogInput): Omit<ServiceCatalogInput, "id"> & { id?: string } | null {
  const name = input.name?.trim();
  if (!name) return null;
  const out: Omit<ServiceCatalogInput, "id"> & { id?: string } = {
    name,
    price: typeof input.price === "number" && !Number.isNaN(input.price) ? input.price : undefined,
    image: input.image?.trim() || undefined,
    kind: input.kind?.trim() || undefined,
  };
  const id = input.id?.trim();
  if (id) out.id = id;
  return out;
}

export async function addProductFromAdmin(input: ProductCatalogInput): Promise<CatalogResult> {
  const product = normalizeProductInput(input);
  if (!product) return { ok: false, error: "Product name is required" };
  const { items, updatedAt } = await loadProducts();
  const catalog = repairCatalogIds(items, "prod");
  catalog.push({ ...product, id: newCatalogId("prod") });
  return saveProducts(catalog, updatedAt);
}

export async function updateProductFromAdmin(input: ProductCatalogInput): Promise<CatalogResult> {
  const id = input.id?.trim();
  if (!id) return { ok: false, error: "Missing product id" };
  const product = normalizeProductInput(input);
  if (!product) return { ok: false, error: "Product name is required" };
  const { items, updatedAt } = await loadProducts();
  const catalog = repairCatalogIds(items, "prod");
  let found = false;
  const next = catalog.map((raw) => {
    const o = asRecord(raw);
    if (!o || o.id !== id) return raw;
    found = true;
    const { id: _drop, ...fields } = product;
    return { ...o, ...fields, id };
  });
  if (!found) return { ok: false, error: "Product not found" };
  return saveProducts(next, updatedAt);
}

export async function deleteProductFromAdmin(id: string): Promise<CatalogResult> {
  const target = id.trim();
  if (!target) return { ok: false, error: "Missing product id" };
  const { items, updatedAt } = await loadProducts();
  const catalog = repairCatalogIds(items, "prod");
  const next = catalog.filter((raw) => {
    const o = asRecord(raw);
    return !o || o.id !== target;
  });
  if (next.length === catalog.length) return { ok: false, error: "Product not found" };
  return saveProducts(next, updatedAt);
}

export async function addServiceFromAdmin(input: ServiceCatalogInput): Promise<CatalogResult> {
  const service = normalizeServiceInput(input);
  if (!service) return { ok: false, error: "Service name is required" };
  const { items, updatedAt } = await loadServices();
  const catalog = repairCatalogIds(items, "svc");
  catalog.push({ ...service, id: newCatalogId("svc") });
  return saveServices(catalog, updatedAt);
}

export async function updateServiceFromAdmin(input: ServiceCatalogInput): Promise<CatalogResult> {
  const id = input.id?.trim();
  if (!id) return { ok: false, error: "Missing service id" };
  const service = normalizeServiceInput(input);
  if (!service) return { ok: false, error: "Service name is required" };
  const { items, updatedAt } = await loadServices();
  const catalog = repairCatalogIds(items, "svc");
  let found = false;
  const next = catalog.map((raw) => {
    const o = asRecord(raw);
    if (!o || o.id !== id) return raw;
    found = true;
    const { id: _drop, ...fields } = service;
    return { ...o, ...fields, id };
  });
  if (!found) return { ok: false, error: "Service not found" };
  return saveServices(next, updatedAt);
}

export async function deleteServiceFromAdmin(id: string): Promise<CatalogResult> {
  const target = id.trim();
  if (!target) return { ok: false, error: "Missing service id" };
  const { items, updatedAt } = await loadServices();
  const catalog = repairCatalogIds(items, "svc");
  const next = catalog.filter((raw) => {
    const o = asRecord(raw);
    return !o || o.id !== target;
  });
  if (next.length === catalog.length) return { ok: false, error: "Service not found" };
  return saveServices(next, updatedAt);
}
