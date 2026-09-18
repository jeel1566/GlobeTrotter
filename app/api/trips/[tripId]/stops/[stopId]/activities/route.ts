import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    tripId: string;
    stopId: string;
  }>;
}

// POST /api/trips/:tripId/stops/:stopId/activities
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { tripId, stopId } = await context.params;
    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Activity title is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const newActivity = await dataStore.addActivity(tripId, stopId, {
      title: body.title,
      category: body.category || "culture",
      cost: Number(body.cost) || 0,
      duration: body.duration || "1.5 hrs",
      time: body.time || "10:00 AM",
      notes: body.notes || "",
    });

    if (!newActivity) {
      return NextResponse.json(
        { error: "Trip or Stop not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: newActivity }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create activity", code: "CREATE_ACTIVITY_ERROR" },
      { status: 500 }
    );
  }
}
