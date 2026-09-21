import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase/server';
import { User } from '@/types/database';

export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  const adminEmails = adminEmailsEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.trim().toLowerCase());
}

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  // 1. Try to find the user in Supabase
  const { data: existingUser, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (existingUser && !error) {
    // If the user matches ADMIN_EMAILS or Clerk metadata, ensure role is admin
    if (existingUser.role !== 'admin' && isEmailAdmin(existingUser.email)) {
      const { data: elevatedUser } = await supabaseServer
        .from('users')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', existingUser.id)
        .select()
        .single();
      if (elevatedUser) {
        return elevatedUser as User;
      }
    }
    return existingUser as User;
  }

  // 2. Self-healing: if not in database yet, fetch from Clerk and upsert
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress || `${userId}@example.com`;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    clerkUser.username ||
    'Traveler';
  const avatar_url = clerkUser.imageUrl || null;
  const isAdmin =
    isEmailAdmin(email) || clerkUser.publicMetadata?.role === 'admin';
  const initialRole = isAdmin ? 'admin' : 'user';

  const { data: newUser, error: insertError } = await supabaseServer
    .from('users')
    .upsert(
      {
        clerk_id: userId,
        email,
        name,
        avatar_url,
        role: initialRole,
        ai_generations_today: 0,
        ai_generations_reset_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_id' }
    )
    .select()
    .single();

  if (insertError) {
    console.error('Error auto-syncing user to Supabase:', insertError);
    return null;
  }

  return newUser as User;
}
