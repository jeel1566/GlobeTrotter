import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const event = await verifyWebhook(req);

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const data = event.data;
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
    } else if (event.type === 'user.deleted') {
      const clerkId = event.data.id;
      await supabaseServer.from('users').delete().eq('clerk_id', clerkId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Clerk webhook error:', err);
    return NextResponse.json({ error: 'Invalid webhook request' }, { status: 400 });
  }
}
