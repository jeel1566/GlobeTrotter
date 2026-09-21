import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-current-user';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null, isAdmin: false }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        clerk_id: user.clerk_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
      },
      isAdmin: user.role === 'admin',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch user session', user: null, isAdmin: false },
      { status: 500 }
    );
  }
}
