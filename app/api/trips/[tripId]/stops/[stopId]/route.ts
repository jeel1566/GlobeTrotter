import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    tripId: string;
    stopId: string;
  }>;
}

// DELETE /api/trips/:tripId/stops/:stopId
export async function DELETE(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const { tripId, stopId } = await context.params;
    const success = await dataStore.deleteStop(tripId, stopId);

    if (!success) {
      return NextResponse.json(
        { error: "Stop or Trip not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true, deletedStopId: stopId } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete stop", code: "DELETE_STOP_ERROR" },
      { status: 500 }
    );
  }
}
