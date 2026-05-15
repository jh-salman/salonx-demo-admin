import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { salonxApiOrigin } from "@/lib/salonx-api-url";

export type DashboardWaitlistItem = {
  id: string;
  title: string;
  service: string;
  waitlistAddedAt: string;
};

export type DashboardParkedItem = {
  id: string;
  title: string;
  service: string;
  fromMove?: boolean;
};

export type DashboardAppointment = {
  id: string;
  clientName: string;
  service: string;
  start: string;
  end: string;
  color: string;
};

export type DashboardCatalogClient = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  notes?: string;
};

export type DashboardCatalogService = {
  id: string;
  name: string;
  price?: number;
  image?: string;
  kind?: string;
};

export type DashboardCatalogProduct = {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
  color?: string;
  stationTag?: string;
};

export type CalendarDashboardData = {
  dbConfigured: boolean;
  /** Where counts/lists were loaded from. */
  dataSource: "demo-api" | "local-api" | "prisma" | "none";
  apiOrigin?: string;
  counts: {
    appointments: number;
    waitlist: number;
    parked: number;
    clients: number;
    services: number;
    products: number;
  };
  upcomingAppointments: DashboardAppointment[];
  waitlist: DashboardWaitlistItem[];
  parked: DashboardParkedItem[];
  recentClients: DashboardCatalogClient[];
  /** Full client catalog for waitlist picker (same as salonx-web-v2). */
  catalogClients: DashboardCatalogClient[];
  /** Full service catalog for waitlist picker. */
  catalogServices: DashboardCatalogService[];
  /** Product catalog (mock products mirrored in Postgres). */
  catalogProducts: DashboardCatalogProduct[];
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function parseWaitlist(toolbarEvents: unknown[]): DashboardWaitlistItem[] {
  const out: DashboardWaitlistItem[] = [];
  for (const raw of toolbarEvents) {
    const o = asRecord(raw);
    if (!o || o.isParked === true) continue;
    if (o.waitlistAddedAt == null && !o.service) continue;
    const title = typeof o.title === "string" ? o.title : "";
    if (!title) continue;
    const id = typeof o.id === "string" ? o.id : `wl-${out.length}`;
    const waitlistAddedAt =
      typeof o.waitlistAddedAt === "string"
        ? o.waitlistAddedAt
        : o.waitlistAddedAt instanceof Date
          ? o.waitlistAddedAt.toISOString()
          : new Date().toISOString();
    out.push({
      id,
      title,
      service: typeof o.service === "string" ? o.service : "",
      waitlistAddedAt,
    });
  }
  out.sort(
    (a, b) => new Date(b.waitlistAddedAt).getTime() - new Date(a.waitlistAddedAt).getTime(),
  );
  return out;
}

function parseParked(parkedFromDrag: unknown[], toolbarEvents: unknown[]): DashboardParkedItem[] {
  const out: DashboardParkedItem[] = [];
  const seen = new Set<string>();
  const push = (raw: unknown) => {
    const o = asRecord(raw);
    if (!o) return;
    const id = typeof o.id === "string" ? o.id : "";
    if (!id || seen.has(id)) return;
    seen.add(id);
    const title = typeof o.title === "string" ? o.title : "";
    if (!title) return;
    out.push({
      id,
      title,
      service: typeof o.service === "string" ? o.service : "",
      fromMove: o.fromMove === true,
    });
  };
  for (const e of toolbarEvents) {
    const o = asRecord(e);
    if (o?.isParked === true) push(e);
  }
  for (const p of parkedFromDrag) push(p);
  return out;
}

function parseClients(items: unknown[]): DashboardCatalogClient[] {
  const out: DashboardCatalogClient[] = [];
  for (const raw of items) {
    const o = asRecord(raw);
    if (!o) continue;
    const name = typeof o.name === "string" ? o.name : typeof o.title === "string" ? o.title : "";
    if (!name) continue;
    out.push({
      id: typeof o.id === "string" ? o.id : `c-${out.length}`,
      name,
      phone: typeof o.phone === "string" ? o.phone : undefined,
      email: typeof o.email === "string" ? o.email : undefined,
      avatar: typeof o.avatar === "string" && o.avatar.trim() ? o.avatar.trim() : undefined,
      notes: typeof o.notes === "string" ? o.notes : undefined,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function parseServices(items: unknown[]): DashboardCatalogService[] {
  const out: DashboardCatalogService[] = [];
  for (const raw of items) {
    const o = asRecord(raw);
    if (!o) continue;
    const name = typeof o.name === "string" ? o.name : "";
    if (!name) continue;
    out.push({
      id: typeof o.id === "string" ? o.id : `svc-${out.length}`,
      name,
      price: typeof o.price === "number" ? o.price : undefined,
      image: typeof o.image === "string" && o.image.trim() ? o.image.trim() : undefined,
      kind: typeof o.kind === "string" ? o.kind : undefined,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function parseProducts(items: unknown[]): DashboardCatalogProduct[] {
  const out: DashboardCatalogProduct[] = [];
  for (const raw of items) {
    const o = asRecord(raw);
    if (!o) continue;
    const name = typeof o.name === "string" ? o.name : "";
    if (!name) continue;
    out.push({
      id: typeof o.id === "string" ? o.id : `prod-${out.length}`,
      name,
      brand: typeof o.brand === "string" ? o.brand : undefined,
      price: typeof o.price === "number" ? o.price : undefined,
      imageUrl: typeof o.imageUrl === "string" ? o.imageUrl : undefined,
      color: typeof o.color === "string" ? o.color : undefined,
      stationTag: typeof o.stationTag === "string" ? o.stationTag : undefined,
    });
  }
  return out;
}

function buildDashboard(input: {
  dataSource: CalendarDashboardData["dataSource"];
  apiOrigin?: string;
  appointmentRows: DashboardAppointment[];
  toolbarEvents: unknown[];
  parkedFromDrag: unknown[];
  clientItems: unknown[];
  serviceItems: unknown[];
  productItems: unknown[];
}): CalendarDashboardData {
  const now = Date.now();
  const waitlist = parseWaitlist(input.toolbarEvents);
  const parked = parseParked(input.parkedFromDrag, input.toolbarEvents);
  const catalogClients = parseClients(input.clientItems);
  const catalogServices = parseServices(input.serviceItems);
  const catalogProducts = parseProducts(input.productItems);

  const upcomingAppointments = input.appointmentRows
    .filter((r) => new Date(r.end).getTime() >= now)
    .slice(0, 12);

  return {
    dbConfigured: true,
    dataSource: input.dataSource,
    apiOrigin: input.apiOrigin,
    counts: {
      appointments: input.appointmentRows.length,
      waitlist: waitlist.length,
      parked: parked.length,
      clients: input.clientItems.length,
      services: input.serviceItems.length,
      products: catalogProducts.length,
    },
    upcomingAppointments,
    waitlist,
    parked,
    recentClients: catalogClients.slice(0, 8),
    catalogClients,
    catalogServices,
    catalogProducts,
  };
}

const emptyDashboard: CalendarDashboardData = {
  dbConfigured: false,
  dataSource: "none",
  counts: {
    appointments: 0,
    waitlist: 0,
    parked: 0,
    clients: 0,
    services: 0,
    products: 0,
  },
  upcomingAppointments: [],
  waitlist: [],
  parked: [],
  recentClients: [],
  catalogClients: [],
  catalogServices: [],
  catalogProducts: [],
};

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
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[calendar-dashboard] demo-api", path, res.status, text.slice(0, 200));
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error("[calendar-dashboard] demo-api fetch failed", path, e);
    return null;
  }
}

type AppointmentsListResponse = {
  appointments?: {
    id: string;
    clientName: string;
    service?: string;
    start: string;
    end: string;
    color?: string;
  }[];
};

type ToolbarResponse = {
  parkedFromDrag?: unknown[];
  toolbarEvents?: unknown[];
  updatedAt?: string;
};

type ClientsResponse = {
  clients?: unknown[];
};

type ServiceCatalogResponse = {
  serviceCatalog?: unknown[];
};

type ProductCatalogResponse = {
  products?: unknown[];
};

async function loadFromDemoApi(origin: string): Promise<CalendarDashboardData | null> {
  const now = new Date();
  const from = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + 240 * 24 * 60 * 60 * 1000);
  const qs = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
  });

  const [aptsRes, toolbarRes, clientsRes, servicesRes, productsRes] = await Promise.all([
    demoApiFetch<AppointmentsListResponse>(`/api/appointments?${qs}`),
    demoApiFetch<ToolbarResponse>("/api/calendar-toolbar"),
    demoApiFetch<ClientsResponse>("/api/clients"),
    demoApiFetch<ServiceCatalogResponse>("/api/service-catalog"),
    demoApiFetch<ProductCatalogResponse>("/api/product-catalog"),
  ]);

  if (!aptsRes && !toolbarRes && !clientsRes && !servicesRes && !productsRes) {
    return null;
  }

  const appointmentRows: DashboardAppointment[] = (aptsRes?.appointments ?? []).map((a) => ({
    id: a.id,
    clientName: a.clientName,
    service: a.service ?? "",
    start: a.start,
    end: a.end,
    color: a.color ?? "#3b82f6",
  }));

  return buildDashboard({
    dataSource: "demo-api",
    apiOrigin: origin,
    appointmentRows,
    toolbarEvents: Array.isArray(toolbarRes?.toolbarEvents) ? toolbarRes.toolbarEvents : [],
    parkedFromDrag: Array.isArray(toolbarRes?.parkedFromDrag) ? toolbarRes.parkedFromDrag : [],
    clientItems: Array.isArray(clientsRes?.clients) ? clientsRes.clients : [],
    serviceItems: Array.isArray(servicesRes?.serviceCatalog) ? servicesRes.serviceCatalog : [],
    productItems: Array.isArray(productsRes?.products) ? productsRes.products : [],
  });
}

/** Same-origin Next `/api/*` (when demo-api origin is not set but DATABASE_URL is). */
async function loadFromLocalNextApi(): Promise<CalendarDashboardData | null> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL!.replace(/\/$/, "")}`
      : "http://localhost:3000";

  const now = new Date();
  const from = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + 240 * 24 * 60 * 60 * 1000);
  const qs = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
  });

  const fetchLocal = async <T,>(path: string): Promise<T | null> => {
    try {
      const res = await fetch(`${base}${path}`, { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  const [aptsRes, toolbarRes, clientsRes, servicesRes, productsRes] = await Promise.all([
    fetchLocal<AppointmentsListResponse>(`/api/appointments?${qs}`),
    fetchLocal<ToolbarResponse>("/api/calendar-toolbar"),
    fetchLocal<ClientsResponse>("/api/clients"),
    fetchLocal<ServiceCatalogResponse>("/api/service-catalog"),
    fetchLocal<ProductCatalogResponse>("/api/product-catalog"),
  ]);

  if (!aptsRes && !toolbarRes) return null;

  const appointmentRows: DashboardAppointment[] = (aptsRes?.appointments ?? []).map((a) => ({
    id: a.id,
    clientName: a.clientName,
    service: a.service ?? "",
    start: a.start,
    end: a.end,
    color: a.color ?? "#3b82f6",
  }));

  return buildDashboard({
    dataSource: "local-api",
    apiOrigin: base,
    appointmentRows,
    toolbarEvents: Array.isArray(toolbarRes?.toolbarEvents) ? toolbarRes.toolbarEvents : [],
    parkedFromDrag: Array.isArray(toolbarRes?.parkedFromDrag) ? toolbarRes.parkedFromDrag : [],
    clientItems: Array.isArray(clientsRes?.clients) ? clientsRes.clients : [],
    serviceItems: Array.isArray(servicesRes?.serviceCatalog) ? servicesRes.serviceCatalog : [],
    productItems: Array.isArray(productsRes?.products) ? productsRes.products : [],
  });
}

async function loadFromPrisma(): Promise<CalendarDashboardData | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const now = new Date();
  const from = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + 240 * 24 * 60 * 60 * 1000);

  const [appointmentRows, toolbarRow, clientRow, serviceRow, productRow] = await Promise.all([
    prisma.salonxAppointment.findMany({
      where: {
        AND: [{ startAt: { lt: to } }, { endAt: { gt: from } }],
      },
      orderBy: { startAt: "asc" },
      take: 2000,
    }),
    prisma.salonxCalendarToolbar.findUnique({ where: { id: "default" } }),
    prisma.salonxClientCatalog.findUnique({ where: { id: "default" } }),
    prisma.salonxServiceCatalog.findUnique({ where: { id: "default" } }),
    prisma.salonxProductCatalog.findUnique({ where: { id: "default" } }),
  ]);

  return buildDashboard({
    dataSource: "prisma",
    appointmentRows: appointmentRows.map((r) => ({
      id: r.id,
      clientName: r.clientName,
      service: r.service,
      start: r.startAt.toISOString(),
      end: r.endAt.toISOString(),
      color: r.color,
    })),
    toolbarEvents: Array.isArray(toolbarRow?.toolbarEvents)
      ? (toolbarRow.toolbarEvents as unknown[])
      : [],
    parkedFromDrag: Array.isArray(toolbarRow?.parkedFromDrag)
      ? (toolbarRow.parkedFromDrag as unknown[])
      : [],
    clientItems: Array.isArray(clientRow?.items) ? (clientRow.items as unknown[]) : [],
    serviceItems: Array.isArray(serviceRow?.items) ? (serviceRow.items as unknown[]) : [],
    productItems: Array.isArray(productRow?.items) ? (productRow.items as unknown[]) : [],
  });
}

export async function loadCalendarDashboardData(): Promise<CalendarDashboardData> {
  const origin = salonxApiOrigin();
  if (origin) {
    try {
      const fromDemo = await loadFromDemoApi(origin);
      if (fromDemo) return fromDemo;
    } catch (e) {
      console.error("[calendar-dashboard] demo-api load failed", e);
    }
  }

  try {
    const fromLocal = await loadFromLocalNextApi();
    if (fromLocal) return fromLocal;
  } catch (e) {
    console.error("[calendar-dashboard] local API load failed", e);
  }

  try {
    const fromDb = await loadFromPrisma();
    if (fromDb) return fromDb;
  } catch (e) {
    console.error("[calendar-dashboard] prisma load failed", e);
  }

  return {
    ...emptyDashboard,
    dbConfigured: Boolean(origin || getPrisma()),
    apiOrigin: origin || undefined,
  };
}

async function addWaitlistViaDemoApi(
  title: string,
  service: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const toolbarRes = await demoApiFetch<ToolbarResponse>("/api/calendar-toolbar");
  if (!toolbarRes) {
    return { ok: false, error: "Could not load toolbar from demo-api" };
  }

  const toolbarEvents = Array.isArray(toolbarRes.toolbarEvents)
    ? [...toolbarRes.toolbarEvents]
    : [];
  const parkedFromDrag = Array.isArray(toolbarRes.parkedFromDrag)
    ? toolbarRes.parkedFromDrag
    : [];

  toolbarEvents.push({
    id: `wl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    service: service.trim(),
    waitlistAddedAt: new Date().toISOString(),
    color: "#FA1BFE",
  });

  const putRes = await demoApiFetch<ToolbarResponse>("/api/calendar-toolbar", {
    method: "PUT",
    body: JSON.stringify({
      parkedFromDrag,
      toolbarEvents: toolbarEvents.slice(0, 500),
      ...(toolbarRes.updatedAt ? { expectedUpdatedAt: toolbarRes.updatedAt } : {}),
    }),
  });

  if (!putRes) {
    return { ok: false, error: "demo-api rejected toolbar save (check server logs)" };
  }

  return { ok: true };
}

async function addWaitlistViaPrisma(
  title: string,
  service: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: "DATABASE_URL is not configured" };

  const row = await prisma.salonxCalendarToolbar.findUnique({
    where: { id: "default" },
  });
  const toolbarEvents = Array.isArray(row?.toolbarEvents)
    ? [...(row.toolbarEvents as unknown[])]
    : [];
  const parkedFromDrag = Array.isArray(row?.parkedFromDrag)
    ? (row.parkedFromDrag as unknown[])
    : [];

  toolbarEvents.push({
    id: `wl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    service: service.trim(),
    waitlistAddedAt: new Date().toISOString(),
    color: "#FA1BFE",
  });

  await prisma.salonxCalendarToolbar.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      parkedFromDrag: parkedFromDrag as Prisma.InputJsonValue,
      toolbarEvents: toolbarEvents.slice(0, 500) as Prisma.InputJsonValue,
    },
    update: {
      toolbarEvents: toolbarEvents.slice(0, 500) as Prisma.InputJsonValue,
    },
  });

  return { ok: true };
}

async function removeWaitlistViaDemoApi(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const toolbarRes = await demoApiFetch<ToolbarResponse>("/api/calendar-toolbar");
  if (!toolbarRes) return { ok: false, error: "Could not load toolbar from demo-api" };

  const toolbarEvents = Array.isArray(toolbarRes.toolbarEvents)
    ? toolbarRes.toolbarEvents.filter((e) => {
        const o = asRecord(e);
        return !o || o.id !== id;
      })
    : [];
  const parkedFromDrag = Array.isArray(toolbarRes.parkedFromDrag)
    ? toolbarRes.parkedFromDrag
    : [];

  const putRes = await demoApiFetch<ToolbarResponse>("/api/calendar-toolbar", {
    method: "PUT",
    body: JSON.stringify({
      parkedFromDrag,
      toolbarEvents,
      ...(toolbarRes.updatedAt ? { expectedUpdatedAt: toolbarRes.updatedAt } : {}),
    }),
  });
  if (!putRes) return { ok: false, error: "demo-api rejected toolbar save" };
  return { ok: true };
}

async function removeWaitlistViaPrisma(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: "DATABASE_URL is not configured" };

  const row = await prisma.salonxCalendarToolbar.findUnique({ where: { id: "default" } });
  const toolbarEvents = Array.isArray(row?.toolbarEvents)
    ? (row.toolbarEvents as unknown[]).filter((e) => {
        const o = asRecord(e);
        return !o || o.id !== id;
      })
    : [];
  const parkedFromDrag = Array.isArray(row?.parkedFromDrag)
    ? (row.parkedFromDrag as unknown[])
    : [];

  await prisma.salonxCalendarToolbar.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      parkedFromDrag: parkedFromDrag as Prisma.InputJsonValue,
      toolbarEvents: toolbarEvents as Prisma.InputJsonValue,
    },
    update: {
      toolbarEvents: toolbarEvents as Prisma.InputJsonValue,
    },
  });
  return { ok: true };
}

export async function removeWaitlistEntryFromAdmin(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const target = id.trim();
  if (!target) return { ok: false, error: "Missing waitlist id" };
  if (salonxApiOrigin()) {
    try {
      return await removeWaitlistViaDemoApi(target);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "demo-api remove failed" };
    }
  }
  try {
    return await removeWaitlistViaPrisma(target);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Remove failed" };
  }
}

type ProductInput = {
  name: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
  color?: string;
  stationTag?: string;
};

async function addProductViaDemoApi(
  product: ProductInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const current = await demoApiFetch<ProductCatalogResponse & { updatedAt?: string }>(
    "/api/product-catalog",
  );
  const products = Array.isArray(current?.products) ? [...(current!.products as unknown[])] : [];
  const id = `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  products.push({ id, ...product });

  const putRes = await demoApiFetch<ProductCatalogResponse>("/api/product-catalog", {
    method: "PUT",
    body: JSON.stringify({
      products,
      ...(current?.updatedAt ? { expectedUpdatedAt: current.updatedAt } : {}),
    }),
  });
  if (!putRes) return { ok: false, error: "demo-api rejected product save" };
  return { ok: true };
}

async function addProductViaPrisma(
  product: ProductInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: "DATABASE_URL is not configured" };

  const row = await prisma.salonxProductCatalog.findUnique({ where: { id: "default" } });
  const products = Array.isArray(row?.items) ? [...(row.items as unknown[])] : [];
  const id = `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  products.push({ id, ...product });

  await prisma.salonxProductCatalog.upsert({
    where: { id: "default" },
    create: { id: "default", items: products as Prisma.InputJsonValue },
    update: { items: products as Prisma.InputJsonValue },
  });
  return { ok: true };
}

export async function addProductFromAdmin(
  input: ProductInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Product name is required" };
  const payload: ProductInput = {
    name,
    brand: input.brand?.trim() || undefined,
    price: typeof input.price === "number" && !Number.isNaN(input.price) ? input.price : undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    color: input.color?.trim() || undefined,
    stationTag: input.stationTag?.trim() || undefined,
  };

  if (salonxApiOrigin()) {
    try {
      return await addProductViaDemoApi(payload);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "demo-api save failed" };
    }
  }
  try {
    return await addProductViaPrisma(payload);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function addWaitlistEntryFromAdmin(
  clientId: string,
  serviceId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cid = clientId.trim();
  const sid = serviceId.trim();
  if (!cid) return { ok: false, error: "Select a client from the catalog" };
  if (!sid) return { ok: false, error: "Select a service from the catalog" };

  const dash = await loadCalendarDashboardData();
  const client = dash.catalogClients.find((c) => c.id === cid);
  const service = dash.catalogServices.find((s) => s.id === sid);
  if (!client) {
    return { ok: false, error: "That client is not in the catalog — refresh and try again" };
  }
  if (!service) {
    return { ok: false, error: "That service is not in the catalog — refresh and try again" };
  }

  const title = client.name;
  const serviceName = service.name;

  if (salonxApiOrigin()) {
    try {
      return await addWaitlistViaDemoApi(title, serviceName);
    } catch (e) {
      console.error("[calendar-dashboard] demo-api add waitlist failed", e);
      return { ok: false, error: e instanceof Error ? e.message : "demo-api save failed" };
    }
  }

  try {
    return await addWaitlistViaPrisma(title, serviceName);
  } catch (e) {
    console.error("[calendar-dashboard] add waitlist failed", e);
    return { ok: false, error: e instanceof Error ? e.message : "Save failed" };
  }
}
