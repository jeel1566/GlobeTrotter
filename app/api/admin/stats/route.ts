import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Role check: if not admin, return FORBIDDEN
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Aggregations
    const [{ count: totalUsers }, { count: totalTrips }, { count: publicTrips }] =
      await Promise.all([
        supabaseServer.from('users').select('*', { count: 'exact', head: true }),
        supabaseServer.from('trips').select('*', { count: 'exact', head: true }),
        supabaseServer.from('trips').select('*', { count: 'exact', head: true }).eq('visibility', 'public'),
      ]);

    // Popular cities aggregation
    const { data: stops } = await supabaseServer
      .from('trip_stops')
      .select('city');

    const cityCounts: Record<string, number> = {};
    if (stops) {
      for (const s of stops) {
        const c = s.city.trim();
        cityCounts[c] = (cityCounts[c] || 0) + 1;
      }
    }

    const popularCities = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return NextResponse.json({
      data: {
        total_users: totalUsers || 0,
        total_trips: totalTrips || 0,
        public_trips: publicTrips || 0,
        popular_cities: popularCities,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
