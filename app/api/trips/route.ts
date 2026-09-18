import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = supabaseServer
      .from('trips')
      .select('*, trip_stops(id, city, country, order_index)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status && ['draft', 'active', 'completed'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: trips, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ data: trips });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description = '',
      start_date = null,
      end_date = null,
      budget_total = 0,
      cover_image_url = null,
      visibility = 'private',
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Trip title is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        { error: 'End date must be on or after start date', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { data: trip, error } = await supabaseServer
      .from('trips')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        start_date: start_date || null,
        end_date: end_date || null,
        budget_total: Number(budget_total) || 0,
        cover_image_url: cover_image_url || null,
        visibility: visibility === 'public' ? 'public' : 'private',
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ data: trip }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
