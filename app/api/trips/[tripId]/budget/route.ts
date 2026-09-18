import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { tripId } = await context.params;
    const budget = await dataStore.getBudget(tripId);

    return NextResponse.json({ data: budget });
  } catch (error) {
    console.error("GET /api/trips/:tripId/budget error:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { tripId } = await context.params;
    const trip = await dataStore.getTripById(tripId);
    if (!trip) {
      return NextResponse.json(
        { error: `Trip '${tripId}' not found`, code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { label, amount, category, date, paidBy, status } = body;

    if (!label || label.trim().length === 0) {
      return NextResponse.json(
        { error: "Item label is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return NextResponse.json(
        { error: "Amount must be a non-negative number", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const newItem = await dataStore.addBudgetItem(tripId, {
      label: label.trim(),
      amount: numericAmount,
      category: category || "Food",
      date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      paidBy: paidBy || "Jeel Patel",
      status: status || "Paid",
    });

    return NextResponse.json({ data: newItem }, { status: 201 });
  } catch (error) {
    console.error("POST /api/trips/:tripId/budget error:", error);
    return NextResponse.json(
      { error: "Failed to create budget item", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
