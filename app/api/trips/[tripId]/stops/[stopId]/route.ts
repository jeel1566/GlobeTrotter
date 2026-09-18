import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { tripId: string; stopId: string } }
) {
  try {
    const { tripId, stopId } = params;
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
    const allowed = ['city', 'country', 'arrival_date', 'departure_date', 'order_index'];
    const updateData: Record<string, any> = {};

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const { data: updated, error } = await supabaseServer
      .from('trip_stops')
      .update(updateData)
      .eq('id', stopId)
      .eq('trip_id', tripId)
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
  { params }: { params: { tripId: string; stopId: string } }
) {
  try {
    const { tripId, stopId } = params;
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

    const { error } = await supabaseServer
      .from('trip_stops')
      .delete()
      .eq('id', stopId)
      .eq('trip_id', tripId);

    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
