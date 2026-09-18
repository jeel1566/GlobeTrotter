import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

interface RouteParams {
  params: {
    tripId: string;
  };
}

// GET /api/trips/:tripId
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const trip = await dataStore.getTripById(params.tripId);
    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: trip });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch trip", code: "FETCH_TRIP_ERROR" },
      { status: 500 }
    );
  }
}

// PATCH /api/trips/:tripId
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();
    const updated = await dataStore.updateTrip(params.tripId, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Trip not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update trip", code: "UPDATE_TRIP_ERROR" },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/:tripId
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const success = await dataStore.deleteTrip(params.tripId);
    if (!success) {
      return NextResponse.json(
        { error: "Trip not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true, deletedId: params.tripId } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete trip", code: "DELETE_TRIP_ERROR" },
      { status: 500 }
    );
  }
}
