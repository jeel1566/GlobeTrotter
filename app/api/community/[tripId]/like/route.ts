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

    // Upsert into trip_likes (idempotent)
    const { error } = await supabaseServer
      .from('trip_likes')
      .upsert({ trip_id: tripId, user_id: user.id }, { onConflict: 'trip_id,user_id' });

    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    // Return new count
    const { count } = await supabaseServer
      .from('trip_likes')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', tripId);

    return NextResponse.json({ data: { liked: true, like_count: count || 0 } });
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    await supabaseServer
      .from('trip_likes')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', user.id);

    const { count } = await supabaseServer
      .from('trip_likes')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', tripId);

    return NextResponse.json({ data: { liked: false, like_count: count || 0 } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
