import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string; stopId: string } }
) {
  try {
    const { tripId, stopId } = params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Verify trip ownership
    const { data: trip } = await supabaseServer
      .from('trips')
      .select('user_id')
      .eq('id', tripId)
      .single();

    if (!trip || trip.user_id !== user.id) {
      return NextResponse.json({ error: 'Trip not found or unauthorized', code: 'FORBIDDEN' }, { status: 403 });
    }

    // Verify stop belongs to trip
    const { data: stop } = await supabaseServer
      .from('trip_stops')
      .select('id')
      .eq('id', stopId)
      .eq('trip_id', tripId)
      .single();

    if (!stop) {
      return NextResponse.json({ error: 'Stop not found in this trip', code: 'NOT_FOUND' }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      category = 'nature',
      cost = 0,
      duration_minutes = 60,
      notes = '',
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Activity title is required', code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    // Next order index
    const { data: currentActs } = await supabaseServer
      .from('activities')
      .select('order_index')
      .eq('stop_id', stopId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextIndex = currentActs && currentActs.length > 0 ? currentActs[0].order_index + 1 : 0;

    const { data: activity, error } = await supabaseServer
      .from('activities')
      .insert({
        stop_id: stopId,
        title: title.trim(),
        category: ['adventure', 'food', 'nature', 'nightlife', 'culture'].includes(category)
          ? category
          : 'nature',
        cost: Number(cost) || 0,
        duration_minutes: Number(duration_minutes) || 60,
        notes: notes?.trim() || null,
        order_index: nextIndex,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
