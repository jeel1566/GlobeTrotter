import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 1. Create the Demo Trip
    const { data: trip, error: tripErr } = await supabaseServer
      .from('trips')
      .insert({
        user_id: user.id,
        title: 'Goa Coastal & Heritage Expedition',
        description: 'Complete 5-day itinerary exploring Portuguese churches, cliffside sunsets, and water sports.',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        budget_total: 25000,
        cover_image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80',
        visibility: 'public',
        status: 'active',
      })
      .select()
      .single();

    if (tripErr || !trip) {
      return NextResponse.json({ error: tripErr?.message || 'Failed to seed demo trip' }, { status: 500 });
    }

    // 2. Stop 1: North Goa
    const { data: stop1 } = await supabaseServer
      .from('trip_stops')
      .insert({
        trip_id: trip.id,
        city: 'North Goa (Anjuna & Vagator)',
        country: 'India',
        order_index: 0,
      })
      .select()
      .single();

    if (stop1) {
      await supabaseServer.from('activities').insert([
        {
          stop_id: stop1.id,
          title: 'Sunset & Drinks at Curlies Shack',
          category: 'food',
          cost: 1500,
          duration_minutes: 120,
          notes: 'Right on the beach rocks',
          order_index: 0,
        },
        {
          stop_id: stop1.id,
          title: 'Parasailing & Jet Ski at Baga Beach',
          category: 'adventure',
          cost: 2500,
          duration_minutes: 180,
          notes: 'Negotiate combo package',
          order_index: 1,
        },
        {
          stop_id: stop1.id,
          title: 'Chapora Fort (Dil Chahta Hai point)',
          category: 'culture',
          cost: 0,
          duration_minutes: 90,
          notes: 'Great sea view',
          order_index: 2,
        },
      ]);
    }

    // 3. Stop 2: Old Goa & Panjim
    const { data: stop2 } = await supabaseServer
      .from('trip_stops')
      .insert({
        trip_id: trip.id,
        city: 'Panjim & Old Goa',
        country: 'India',
        order_index: 1,
      })
      .select()
      .single();

    if (stop2) {
      await supabaseServer.from('activities').insert([
        {
          stop_id: stop2.id,
          title: 'Basilica of Bom Jesus & Se Cathedral',
          category: 'culture',
          cost: 100,
          duration_minutes: 120,
          notes: 'UNESCO Heritage monument',
          order_index: 0,
        },
        {
          stop_id: stop2.id,
          title: 'Fontainhas Latin Quarter Walking Tour',
          category: 'nature',
          cost: 0,
          duration_minutes: 90,
          notes: 'Vibrant yellow and blue Portuguese homes',
          order_index: 1,
        },
        {
          stop_id: stop2.id,
          title: 'Mandovi River Dinner Cruise',
          category: 'nightlife',
          cost: 2000,
          duration_minutes: 150,
          notes: 'Includes Goan folk dance',
          order_index: 2,
        },
      ]);
    }

    // 4. Fixed Budget Overhead Items
    await supabaseServer.from('budget_items').insert([
      {
        trip_id: trip.id,
        category: 'flights',
        label: 'Roundtrip Flights (IndiGo)',
        amount: 8500,
      },
      {
        trip_id: trip.id,
        category: 'hotels',
        label: 'Beach Villa Resort (4 Nights)',
        amount: 7200,
      },
      {
        trip_id: trip.id,
        category: 'transport',
        label: 'Scooter Rental & Fuel',
        amount: 1800,
      },
    ]);

    return NextResponse.json({
      data: {
        message: 'Demo trip seeded successfully!',
        trip_id: trip.id,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
