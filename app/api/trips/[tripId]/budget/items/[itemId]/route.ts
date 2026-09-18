import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { tripId: string; itemId: string } }
) {
  try {
    const { tripId, itemId } = params;
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
      .from('budget_items')
      .delete()
      .eq('id', itemId)
      .eq('trip_id', tripId);

    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
