import {
  getPrismaOrNull,
  prismaUnavailableResponse,
  toDto,
} from "@/lib/appointments-api";
import { withCors } from "@/lib/cors";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

function parseRange(url: URL): { from: Date; to: Date } | { error: string } {
  const fromRaw = url.searchParams.get("from");
  const toRaw = url.searchParams.get("to");
  if (fromRaw && toRaw) {
    const from = new Date(fromRaw);
    const to = new Date(toRaw);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return { error: "Invalid from or to (use ISO-8601 strings)" };
    }
    if (from.getTime() >= to.getTime()) {
      return { error: "from must be before to" };
    }
    return { from, to };
  }
  const to = new Date();
  const from = new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000);
  return { from, to };
}

/** List appointments overlapping [from, to). Optional query: from, to (ISO). */
export async function GET(request: Request) {
  const prisma = getPrismaOrNull();
  if (!prisma) {
    const u = prismaUnavailableResponse();
    return withCors(NextResponse.json(u.body, { status: u.status }));
  }

  const range = parseRange(new URL(request.url));
  if ("error" in range) {
    return withCors(NextResponse.json({ error: range.error }, { status: 400 }));
  }

  const rows = await prisma.salonxAppointment.findMany({
    where: {
      AND: [{ startAt: { lt: range.to } }, { endAt: { gt: range.from } }],
    },
    orderBy: { startAt: "asc" },
    take: 2000,
  });

  return withCors(
    NextResponse.json({
      appointments: rows.map(toDto),
    }),
  );
}

/** Create one appointment. Body: { clientName, service?, start, end, color?, price?, notes?, seriesId? } (start/end ISO). */
export async function POST(request: Request) {
  const prisma = getPrismaOrNull();
  if (!prisma) {
    const u = prismaUnavailableResponse();
    return withCors(NextResponse.json(u.body, { status: u.status }));
  }

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
  const clientName = typeof b.clientName === "string" ? b.clientName.trim() : "";
  if (!clientName) {
    return withCors(NextResponse.json({ error: "clientName is required" }, { status: 400 }));
  }
  const start = typeof b.start === "string" ? new Date(b.start) : null;
  const end = typeof b.end === "string" ? new Date(b.end) : null;
  if (!start || Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime())) {
    return withCors(
      NextResponse.json({ error: "start and end are required ISO date strings" }, { status: 400 }),
    );
  }
  if (end.getTime() <= start.getTime()) {
    return withCors(NextResponse.json({ error: "end must be after start" }, { status: 400 }));
  }

  const service = typeof b.service === "string" ? b.service : "";
  const color = typeof b.color === "string" && b.color.trim() ? b.color.trim() : "#3b82f6";
  const price =
    typeof b.price === "number" && Number.isFinite(b.price)
      ? b.price
      : typeof b.price === "string"
        ? Number.parseFloat(b.price) || 0
        : 0;
  const notes =
    typeof b.notes === "string" ? b.notes.trim().slice(0, 4000) : "";
  const seriesId =
    typeof b.seriesId === "string" && b.seriesId.trim() ? b.seriesId.trim() : null;

  try {
    const row = await prisma.salonxAppointment.create({
      data: {
        clientName,
        service,
        startAt: start,
        endAt: end,
        color,
        price,
        notes,
        seriesId,
      },
    });

    return withCors(NextResponse.json({ appointment: toDto(row) }, { status: 201 }));
  } catch (e) {
    console.error("[api/appointments POST] create failed", e);
    const message = e instanceof Error ? e.message : "Create failed";
    return withCors(NextResponse.json({ error: message }, { status: 500 }));
  }
}
