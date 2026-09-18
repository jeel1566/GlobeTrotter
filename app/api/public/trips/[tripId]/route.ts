import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = params;

    const { data: trip, error } = await supabaseServer
      .from('trips')
      .select(`
        id, title, description, start_date, end_date, budget_total, cover_image_url, visibility, status, created_at,
        user:users(id, name, avatar_url),
        stops:trip_stops(
          id, city, country, arrival_date, departure_date, order_index,
          activities:activities(
            id, title, category, cost, duration_minutes, order_index
          )
        ),
        likes:trip_likes(user_id)
      `)
      .eq('id', tripId)
      .eq('visibility', 'public')
      .single();

    if (error || !trip) {
      return NextResponse.json(
        { error: 'Public trip not found or is private', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (trip.stops) {
      trip.stops.sort((a: any, b: any) => a.order_index - b.order_index);
      trip.stops.forEach((s: any) => {
        if (s.activities) {
          s.activities.sort((a: any, b: any) => a.order_index - b.order_index);
        }
      });
    }

    const likeCount = Array.isArray(trip.likes) ? trip.likes.length : 0;
    const { likes, ...restTrip } = trip as any;

    return NextResponse.json({
      data: {
        ...restTrip,
        like_count: likeCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
