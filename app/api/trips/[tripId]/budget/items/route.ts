import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data: trip } = await supabaseServer
      .from('trips')
      .select('user_id')
      .eq('id', tripId)
      .single();

    if (!trip || trip.user_id !== user.id) {
      return NextResponse.json({ error: 'Trip not found or unauthorized', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await req.json();
    const { category, label, amount } = body;

    const validCategories = ['flights', 'hotels', 'food', 'activities', 'transport', 'shopping'];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid budget category', code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    if (!label || !label.trim()) {
      return NextResponse.json({ error: 'Expense label is required', code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const { data: item, error } = await supabaseServer
      .from('budget_items')
      .insert({
        trip_id: tripId,
        category,
        label: label.trim(),
        amount: Number(amount) || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
