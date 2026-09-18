import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

// GET /api/trips
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const trips = await dataStore.getTrips({ status });
    return NextResponse.json({ data: trips });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch trips", code: "FETCH_TRIPS_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/trips
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Trip title is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const newTrip = await dataStore.createTrip({
      title: body.title,
      description: body.description || "",
      destination: body.destination || "",
      start_date: body.start_date || body.startDate,
      end_date: body.end_date || body.endDate,
      budget_total: body.budget_total || body.budgetTotal || 50000,
      visibility: body.visibility || "private",
      status: body.status || "draft",
      cover_image_url: body.cover_image_url || body.coverImage,
    });

    return NextResponse.json({ data: newTrip }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create trip", code: "CREATE_TRIP_ERROR" },
      { status: 500 }
    );
  }
}
