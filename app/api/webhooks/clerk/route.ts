import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventType = payload?.type;
    const data = payload?.data;

    if (!eventType || !data) {
      return NextResponse.json({ error: 'Missing event payload' }, { status: 400 });
    }

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const clerkId = data.id;
      const email = data.email_addresses?.[0]?.email_address || `${clerkId}@example.com`;
      const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username || 'Traveler';
      const avatarUrl = data.image_url || null;

      await supabaseServer.from('users').upsert(
        {
          clerk_id: clerkId,
          email,
          name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'clerk_id' }
      );
    } else if (eventType === 'user.deleted') {
      const clerkId = data.id;
      await supabaseServer.from('users').delete().eq('clerk_id', clerkId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Clerk webhook error:', err);
    return NextResponse.json({ error: err.message || 'Webhook error' }, { status: 500 });
  }
}
