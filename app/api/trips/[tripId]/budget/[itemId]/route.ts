import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

interface RouteContext {
  params: Promise<{ tripId: string; itemId: string }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { itemId } = await context.params;
    const deleted = await dataStore.deleteBudgetItem(itemId);

    if (!deleted) {
      return NextResponse.json(
        { error: `Budget item '${itemId}' not found`, code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: { success: true, message: "Budget item deleted" },
    });
  } catch (error) {
    console.error("DELETE /api/trips/:tripId/budget/:itemId error:", error);
    return NextResponse.json(
      { error: "Failed to delete budget item", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
