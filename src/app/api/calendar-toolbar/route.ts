import { getPrisma } from "@/lib/prisma";
import { withCors } from "@/lib/cors";
import { asJsonArray } from "@/lib/json-catalog-api";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

const MAX_ITEMS = 500;

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  const prisma = getPrisma();
  if (!prisma) {
    return withCors(
      NextResponse.json({
        stored: false,
        parkedFromDrag: [],
        toolbarEvents: [],
      }),
    );
  }
  try {
    const row = await prisma.salonxCalendarToolbar.findUnique({
      where: { id: "default" },
    });
    if (!row) {
      return withCors(
        NextResponse.json({
          stored: false,
          parkedFromDrag: [],
          toolbarEvents: [],
        }),
      );
    }
    return withCors(
      NextResponse.json({
        stored: true,
        parkedFromDrag: row.parkedFromDrag,
        toolbarEvents: row.toolbarEvents,
        updatedAt: row.updatedAt.toISOString(),
      }),
    );
  } catch (e) {
    console.error("[api/calendar-toolbar GET]", e);
    return withCors(
      NextResponse.json({ error: "Failed to load toolbar state" }, { status: 500 }),
    );
  }
}

export async function PUT(request: Request) {
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
  const parked = asJsonArray(b.parkedFromDrag, MAX_ITEMS) as Prisma.InputJsonValue;
  const toolbar = asJsonArray(b.toolbarEvents, MAX_ITEMS) as Prisma.InputJsonValue;
  const expected =
    typeof b.expectedUpdatedAt === "string" ? b.expectedUpdatedAt.trim() : "";
  try {
    if (expected) {
      const existing = await prisma.salonxCalendarToolbar.findUnique({
        where: { id: "default" },
      });
      if (existing && existing.updatedAt.toISOString() !== expected) {
        return withCors(
          NextResponse.json(
            {
              error: "Toolbar was updated elsewhere",
              stored: true,
              parkedFromDrag: existing.parkedFromDrag,
              toolbarEvents: existing.toolbarEvents,
              updatedAt: existing.updatedAt.toISOString(),
            },
            { status: 409 },
          ),
        );
      }
    }
    await prisma.salonxCalendarToolbar.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        parkedFromDrag: parked,
        toolbarEvents: toolbar,
      },
      update: {
        parkedFromDrag: parked,
        toolbarEvents: toolbar,
      },
    });
    const row = await prisma.salonxCalendarToolbar.findUnique({
      where: { id: "default" },
    });
    if (!row) {
      return withCors(NextResponse.json({ error: "Persist failed" }, { status: 500 }));
    }
    return withCors(
      NextResponse.json({
        stored: true,
        parkedFromDrag: row.parkedFromDrag,
        toolbarEvents: row.toolbarEvents,
        updatedAt: row.updatedAt.toISOString(),
      }),
    );
  } catch (e) {
    console.error("[api/calendar-toolbar PUT]", e);
    return withCors(NextResponse.json({ error: "Save failed" }, { status: 500 }));
  }
}
