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

    // Verify trip ownership
    const { data: trip } = await supabaseServer
      .from('trips')
      .select('user_id')
      .eq('id', tripId)
      .single();

    if (!trip || trip.user_id !== user.id) {
      return NextResponse.json({ error: 'Trip not found or unauthorized', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await req.json();
    const { city, country = '', arrival_date = null, departure_date = null } = body;

    if (!city || !city.trim()) {
      return NextResponse.json({ error: 'City name is required', code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    // Determine next order_index
    const { data: currentStops } = await supabaseServer
      .from('trip_stops')
      .select('order_index')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextIndex = currentStops && currentStops.length > 0 ? currentStops[0].order_index + 1 : 0;

    const { data: stop, error } = await supabaseServer
      .from('trip_stops')
      .insert({
        trip_id: tripId,
        city: city.trim(),
        country: country?.trim() || null,
        arrival_date: arrival_date || null,
        departure_date: departure_date || null,
        order_index: nextIndex,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ data: stop }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
