import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';

export async function PATCH(
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
    const { order } = body; // Array of { id: string, order_index: number }

    if (!Array.isArray(order)) {
      return NextResponse.json(
        { error: 'Expected order array with id and order_index', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Update each stop's order_index in parallel
    const updatePromises = order.map((item: { id: string; order_index: number }) =>
      supabaseServer
        .from('trip_stops')
        .update({ order_index: item.order_index })
        .eq('id', item.id)
        .eq('trip_id', tripId)
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ data: { updated: order.length } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
