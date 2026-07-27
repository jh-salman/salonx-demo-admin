import { getPrisma } from "@/lib/prisma";
import { withCors } from "@/lib/cors";
import { PayloadConflictError, getPayloadRow, putPayloadRow } from "@/lib/json-payload-api";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  const appointmentId = String((await params).appointmentId || "").trim();
  if (!appointmentId) {
    return withCors(NextResponse.json({ error: "appointmentId required" }, { status: 400 }));
  }
  const prisma = getPrisma();
  if (!prisma) {
    return withCors(NextResponse.json({ stored: false, appointmentId, visit: null }));
  }
  try {
    const row = await getPayloadRow(
      prisma.salonxAppointmentVisit as unknown as Parameters<typeof getPayloadRow>[0],
      "appointmentId",
      appointmentId,
    );
    return withCors(
      NextResponse.json({
        stored: row.stored,
        appointmentId,
        visit: row.payload,
        ...(row.stored && "updatedAt" in row ? { updatedAt: row.updatedAt } : {}),
      }),
    );
  } catch (e) {
    console.error("[api/appointment-visit GET]", e);
    return withCors(NextResponse.json({ error: "Failed to load visit state" }, { status: 500 }));
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  const appointmentId = String((await params).appointmentId || "").trim();
  if (!appointmentId) {
    return withCors(NextResponse.json({ error: "appointmentId required" }, { status: 400 }));
  }
  const prisma = getPrisma();
  if (!prisma) {
    return withCors(
      NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 }),
    );
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
  try {
    const row = await putPayloadRow(
      prisma.salonxAppointmentVisit as unknown as Parameters<typeof putPayloadRow>[0],
      "appointmentId",
      appointmentId,
      b.visit,
      typeof b.expectedUpdatedAt === "string" ? b.expectedUpdatedAt : null,
    );
    return withCors(
      NextResponse.json({
        stored: row.stored,
        appointmentId,
        visit: row.payload,
        ...(row.stored && "updatedAt" in row ? { updatedAt: row.updatedAt } : {}),
      }),
    );
  } catch (e) {
    if (e instanceof PayloadConflictError) {
      return withCors(
        NextResponse.json(
          {
            error: e.message,
            appointmentId,
            visit: e.payload,
            updatedAt: e.updatedAt,
          },
          { status: 409 },
        ),
      );
    }
    console.error("[api/appointment-visit PUT]", e);
    return withCors(NextResponse.json({ error: "Save failed" }, { status: 500 }));
  }
}
