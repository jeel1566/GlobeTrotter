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
        id, title, description, start_date, end_date, cover_image_url, visibility, status, created_at,
        user:users!trips_user_id_fkey(id, name, avatar_url),
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

    const sanitizedTrip = {
      id: trip.id,
      title: trip.title,
      description: trip.description,
      start_date: trip.start_date,
      end_date: trip.end_date,
      cover_image_url: trip.cover_image_url,
      visibility: trip.visibility,
      status: trip.status,
      created_at: trip.created_at,
      user: trip.user
        ? {
            id: (trip.user as any).id,
            name: (trip.user as any).name,
            avatar_url: (trip.user as any).avatar_url,
          }
        : null,
      stops: (trip.stops || []).map((s: any) => ({
        id: s.id,
        city: s.city,
        country: s.country,
        arrival_date: s.arrival_date,
        departure_date: s.departure_date,
        order_index: s.order_index,
        activities: (s.activities || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          cost: Number(a.cost) || 0,
          duration_minutes: Number(a.duration_minutes) || 60,
          order_index: a.order_index,
        })),
      })),
      like_count: likeCount,
    };

    return NextResponse.json({ data: sanitizedTrip });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
