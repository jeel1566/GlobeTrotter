import { clerkMiddleware } from '@clerk/nextjs/server';

const protectedPagePrefixes = [
  '/admin',
  '/calendar',
  '/copilot',
  '/dashboard',
  '/profile',
  '/trips',
];

export default clerkMiddleware(async (auth, request) => {
  const isProtectedPage = protectedPagePrefixes.some(
    (prefix) =>
      request.nextUrl.pathname === prefix ||
      request.nextUrl.pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedPage) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
