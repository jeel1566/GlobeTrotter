import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    tripId: string;
  }>;
}

// GET /api/trips/:tripId/stops
export async function GET(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const { tripId } = await context.params;
    const trip = await dataStore.getTripById(tripId);
    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: trip.stops || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch stops", code: "FETCH_STOPS_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/trips/:tripId/stops
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { tripId } = await context.params;
    const body = await request.json();

    if (!body.city || !body.city.trim()) {
      return NextResponse.json(
        { error: "City name is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const newStop = await dataStore.addStop(tripId, {
      city: body.city,
      country: body.country || "Global",
      dates: body.dates || "Dates TBD",
      nights: Number(body.nights) || 2,
    });

    if (!newStop) {
      return NextResponse.json(
        { error: "Trip not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: newStop }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create stop", code: "CREATE_STOP_ERROR" },
      { status: 500 }
    );
  }
}
