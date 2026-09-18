import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    tripId: string;
    stopId: string;
    activityId: string;
  }>;
}

// DELETE /api/trips/:tripId/stops/:stopId/activities/:activityId
export async function DELETE(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const { tripId, stopId, activityId } = await context.params;
    const success = await dataStore.deleteActivity(
      tripId,
      stopId,
      activityId
    );

    if (!success) {
      return NextResponse.json(
        { error: "Activity not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: { success: true, deletedActivityId: activityId },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete activity", code: "DELETE_ACTIVITY_ERROR" },
      { status: 500 }
    );
  }
}
