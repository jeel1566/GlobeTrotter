import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';

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

    // Fetch trip with nested stops and activities
    const { data: trip, error } = await supabaseServer
      .from('trips')
      .select(`
        *,
        stops:trip_stops(
          id, city, country, arrival_date, departure_date, order_index,
          activities:activities(
            id, title, category, cost, duration_minutes, notes, order_index
          )
        ),
        budget_items:budget_items(
          id, category, label, amount
        ),
        user:users!trips_user_id_fkey(id, name, avatar_url)
      `)
      .eq('id', tripId)
      .single();

    if (error || !trip) {
      if (error) console.error('Database query error in /api/trips/[tripId]:', error);
      return NextResponse.json({ error: 'Trip not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Access control: strictly owner-only even when trip is public
    if (trip.user_id !== user.id) {
      return NextResponse.json({ error: 'Trip not found or unauthorized', code: 'FORBIDDEN' }, { status: 403 });
    }

    // Sort stops and activities by order_index
    if (trip.stops) {
      trip.stops.sort((a: any, b: any) => a.order_index - b.order_index);
      trip.stops.forEach((s: any) => {
        if (s.activities) {
          s.activities.sort((a: any, b: any) => a.order_index - b.order_index);
        }
      });
    }

    return NextResponse.json({ data: trip });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}

export async function PATCH(
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

    // Check ownership
    const { data: existing, error: findError } = await supabaseServer
      .from('trips')
      .select('id, user_id')
      .eq('id', tripId)
      .single();

    if (findError || !existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Trip not found or unauthorized', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await req.json();
    const allowedFields = ['title', 'description', 'start_date', 'end_date', 'budget_total', 'cover_image_url', 'visibility', 'status'];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data: updated, error } = await supabaseServer
      .from('trips')
      .update(updateData)
      .eq('id', tripId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}

export async function DELETE(
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

    const { data: existing, error: findError } = await supabaseServer
      .from('trips')
      .select('id, user_id')
      .eq('id', tripId)
      .single();

    if (findError || !existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Trip not found or unauthorized', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { error } = await supabaseServer.from('trips').delete().eq('id', tripId);
    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
