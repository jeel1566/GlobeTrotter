import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    let query = supabaseServer
      .from('trips')
      .select(`
        id, title, description, start_date, end_date, cover_image_url, created_at,
        user:users!trips_user_id_fkey(id, name, avatar_url),
        stops:trip_stops(id, city, country, order_index),
        likes:trip_likes(user_id),
        saves:trip_saves(user_id)
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false });

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    const { data: trips, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    const formatted = (trips || []).map((t: any) => {
      const likesList = t.likes || [];
      const savesList = t.saves || [];
      const isLiked = user ? likesList.some((l: any) => l.user_id === user.id) : false;
      const isSaved = user ? savesList.some((s: any) => s.user_id === user.id) : false;
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        start_date: t.start_date,
        end_date: t.end_date,
        cover_image_url: t.cover_image_url,
        created_at: t.created_at,
        owner_name: t.user?.name || 'Traveler',
        owner_avatar: t.user?.avatar_url || null,
        stops: t.stops || [],
        like_count: likesList.length,
        is_liked: isLiked,
        is_saved: isSaved,
      };
    });

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
