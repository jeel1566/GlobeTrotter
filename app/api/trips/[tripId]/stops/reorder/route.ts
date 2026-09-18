import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    tripId: string;
  }>;
}

// PATCH /api/trips/:tripId/stops/reorder
export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { tripId } = await context.params;
    const body = await request.json();

    if (!body.order || !Array.isArray(body.order)) {
      return NextResponse.json(
        { error: "Invalid order array", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const success = await dataStore.reorderStops(tripId, body.order);

    if (!success) {
      return NextResponse.json(
        { error: "Trip not found or reorder failed", code: "REORDER_ERROR" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true, updatedCount: body.order.length } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to reorder stops", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
