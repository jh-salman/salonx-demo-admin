import { ensureDefaultStaffCatalog } from "@/lib/ensure-default-catalog";
import { getPrisma } from "@/lib/prisma";
import { withCors } from "@/lib/cors";
import { CatalogConflictError, getCatalogRow, putCatalogRow } from "@/lib/json-catalog-api";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  const prisma = getPrisma();
  if (!prisma) {
    return withCors(NextResponse.json({ stored: false, staff: [] }));
  }
  try {
    await ensureDefaultStaffCatalog();
    const row = await getCatalogRow(prisma.salonxStaffCatalog);
    return withCors(
      NextResponse.json({
        stored: row.stored,
        staff: row.items,
        ...(row.stored && "updatedAt" in row ? { updatedAt: row.updatedAt } : {}),
      }),
    );
  } catch (e) {
    console.error("[api/staff GET]", e);
    return withCors(NextResponse.json({ error: "Failed to load staff" }, { status: 500 }));
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
  try {
    const row = await putCatalogRow(
      prisma.salonxStaffCatalog,
      b.staff,
      typeof b.expectedUpdatedAt === "string" ? b.expectedUpdatedAt : null,
    );
    return withCors(
      NextResponse.json({
        stored: row.stored,
        staff: row.items,
        ...(row.stored && "updatedAt" in row ? { updatedAt: row.updatedAt } : {}),
      }),
    );
  } catch (e) {
    if (e instanceof CatalogConflictError) {
      return withCors(
        NextResponse.json(
          {
            error: e.message,
            stored: true,
            staff: e.items,
            updatedAt: e.updatedAt,
          },
          { status: 409 },
        ),
      );
    }
    console.error("[api/staff PUT]", e);
    return withCors(NextResponse.json({ error: "Save failed" }, { status: 500 }));
  }
}
