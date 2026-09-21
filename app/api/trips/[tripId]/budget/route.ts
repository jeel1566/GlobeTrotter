import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';
import { BudgetCategory, BudgetSummary } from '@/types/database';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = params;
    if (!tripId || !UUID_REGEX.test(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID format', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabaseServer
      .from('trips')
      .select('id, user_id, budget_total')
      .eq('id', tripId)
      .single();

    if (tripError || !trip || trip.user_id !== user.id) {
      return NextResponse.json({ error: 'Trip not found or unauthorized', code: 'FORBIDDEN' }, { status: 403 });
    }

    // Fetch all stops and their activities
    const { data: stops } = await supabaseServer
      .from('trip_stops')
      .select('id, activities(id, title, category, cost)')
      .eq('trip_id', tripId);

    // Fetch all manual budget line items
    const { data: budgetItems } = await supabaseServer
      .from('budget_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });

    const totalBudget = Number(trip.budget_total) || 0;
    const categoryTotals: Record<BudgetCategory, number> = {
      flights: 0,
      hotels: 0,
      food: 0,
      activities: 0,
      transport: 0,
      shopping: 0,
    };

    let activityCostSum = 0;

    // Roll up activity costs
    if (stops) {
      for (const stop of stops) {
        const activities = (stop as any).activities || [];
        for (const act of activities) {
          const cost = Number(act.cost) || 0;
          activityCostSum += cost;
          if (act.category === 'food') {
            categoryTotals.food += cost;
          } else {
            // adventure, nature, nightlife, culture roll up into activities category
            categoryTotals.activities += cost;
          }
        }
      }
    }

    let budgetItemsSum = 0;
    const items = budgetItems || [];
    for (const item of items) {
      const amount = Number(item.amount) || 0;
      budgetItemsSum += amount;
      const cat = item.category as BudgetCategory;
      if (categoryTotals[cat] !== undefined) {
        categoryTotals[cat] += amount;
      }
    }

    const plannedCost = activityCostSum + budgetItemsSum;
    const remaining = totalBudget - plannedCost;

    const summary: BudgetSummary = {
      budget_total: totalBudget,
      planned_cost: plannedCost,
      remaining: remaining,
      by_category: categoryTotals,
      items: items,
    };

    return NextResponse.json({ data: summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
