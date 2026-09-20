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

    // 1. Fetch original trip with stops and activities
    const { data: originalTrip, error: fetchErr } = await supabaseServer
      .from('trips')
      .select(`
        *,
        stops:trip_stops(
          city, country, arrival_date, departure_date, order_index,
          activities:activities(
            title, category, cost, duration_minutes, order_index
          )
        )
      `)
      .eq('id', tripId)
      .single();

    if (fetchErr || !originalTrip) {
      return NextResponse.json({ error: 'Trip not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Must be public or owned
    if (originalTrip.visibility !== 'public' && originalTrip.user_id !== user.id) {
      return NextResponse.json({ error: 'Cannot copy private trip', code: 'FORBIDDEN' }, { status: 403 });
    }

    // 2. Clone the trips row
    const { data: newTrip, error: insertTripErr } = await supabaseServer
      .from('trips')
      .insert({
        user_id: user.id,
        title: `${originalTrip.title} (Clone)`,
        description: originalTrip.description,
        start_date: originalTrip.start_date,
        end_date: originalTrip.end_date,
        budget_total: 0,
        cover_image_url: originalTrip.cover_image_url,
        visibility: 'private',
        status: 'draft',
      })
      .select()
      .single();

    if (insertTripErr || !newTrip) {
      return NextResponse.json({ error: insertTripErr?.message || 'Failed to clone trip', code: 'DB_ERROR' }, { status: 500 });
    }

    // 3. Clone stops & activities
    const originalStops = originalTrip.stops || [];
    for (const stop of originalStops) {
      const { data: newStop, error: stopErr } = await supabaseServer
        .from('trip_stops')
        .insert({
          trip_id: newTrip.id,
          city: stop.city,
          country: stop.country,
          arrival_date: stop.arrival_date,
          departure_date: stop.departure_date,
          order_index: stop.order_index,
        })
        .select()
        .single();

      if (!stopErr && newStop) {
        const activities = stop.activities || [];
        if (activities.length > 0) {
          const newActivities = activities.map((a: any) => ({
            stop_id: newStop.id,
            title: a.title,
            category: a.category,
            cost: a.cost,
            duration_minutes: a.duration_minutes,
            order_index: a.order_index,
            notes: null, // Personal notes stripped per specification
          }));

          await supabaseServer.from('activities').insert(newActivities);
        }
      }
    }

    return NextResponse.json({ data: { new_trip_id: newTrip.id } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
