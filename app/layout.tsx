import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GlobeTrotter — AI Travel OS',
  description: 'Turn your travel dreams into reality with modern AI travel planning, live budget tracking, and interactive itineraries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased bg-[#FAFAFA] text-[#111827] font-sans selection:bg-blue-600 selection:text-white">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
