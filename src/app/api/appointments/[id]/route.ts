import {
  getPrismaOrNull,
  prismaUnavailableResponse,
  toDto,
} from "@/lib/appointments-api";
import { withCors } from "@/lib/cors";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(_request: Request, ctx: RouteCtx) {
  const prisma = getPrismaOrNull();
  if (!prisma) {
    const u = prismaUnavailableResponse();
    return withCors(NextResponse.json(u.body, { status: u.status }));
  }
  const { id } = await ctx.params;
  const row = await prisma.salonxAppointment.findUnique({ where: { id } });
  if (!row) {
    return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
  }
  return withCors(NextResponse.json({ appointment: toDto(row) }));
}

/** Partial update: any of clientName, service, start, end, color, price, notes, seriesId */
export async function PATCH(request: Request, ctx: RouteCtx) {
  const prisma = getPrismaOrNull();
  if (!prisma) {
    const u = prismaUnavailableResponse();
    return withCors(NextResponse.json(u.body, { status: u.status }));
  }
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }
  if (!body || typeof body !== "object") {
    return withCors(NextResponse.json({ error: "Expected JSON object" }, { status: 400 }));
  }
  const b = body as Record<string, unknown>;

  const data: {
    clientName?: string;
    service?: string;
    startAt?: Date;
    endAt?: Date;
    color?: string;
    price?: number;
    notes?: string;
    seriesId?: string | null;
  } = {};

  if (typeof b.clientName === "string") {
    const t = b.clientName.trim();
    if (!t) {
      return withCors(NextResponse.json({ error: "clientName cannot be empty" }, { status: 400 }));
    }
    data.clientName = t;
  }
  if (typeof b.service === "string") data.service = b.service;
  if (typeof b.start === "string") {
    const d = new Date(b.start);
    if (Number.isNaN(d.getTime())) {
      return withCors(NextResponse.json({ error: "Invalid start" }, { status: 400 }));
    }
    data.startAt = d;
  }
  if (typeof b.end === "string") {
    const d = new Date(b.end);
    if (Number.isNaN(d.getTime())) {
      return withCors(NextResponse.json({ error: "Invalid end" }, { status: 400 }));
    }
    data.endAt = d;
  }
  if (typeof b.color === "string") data.color = b.color.trim() || "#3b82f6";
  if (typeof b.price === "number" && Number.isFinite(b.price)) data.price = b.price;
  if (typeof b.price === "string" && b.price.trim()) {
    const n = Number.parseFloat(b.price);
    if (Number.isFinite(n)) data.price = n;
  }
  if (typeof b.notes === "string") data.notes = b.notes.trim().slice(0, 4000);
  if (b.seriesId === null) data.seriesId = null;
  else if (typeof b.seriesId === "string") data.seriesId = b.seriesId.trim() || null;

  if (Object.keys(data).length === 0) {
    return withCors(NextResponse.json({ error: "No fields to update" }, { status: 400 }));
  }

  try {
    const row = await prisma.salonxAppointment.update({
      where: { id },
      data,
    });
    return withCors(NextResponse.json({ appointment: toDto(row) }));
  } catch {
    return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
  }
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  const prisma = getPrismaOrNull();
  if (!prisma) {
    const u = prismaUnavailableResponse();
    return withCors(NextResponse.json(u.body, { status: u.status }));
  }
  const { id } = await ctx.params;
  try {
    await prisma.salonxAppointment.delete({ where: { id } });
  } catch {
    return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
  }
  return withCors(new NextResponse(null, { status: 204 }));
}
