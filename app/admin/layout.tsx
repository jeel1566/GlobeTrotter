import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/get-current-user';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If not logged in, redirect to sign-in
  if (!user) {
    redirect('/sign-in');
  }

  // Strict role gate: Only admin role can access the admin panel
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
