import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlobeTrotter AI — Plan together. Go further.",
  description: "Centralized travel planning platform: multi-city itineraries, budget tracking, live co-traveler collaboration, and AI generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-[100dvh] antialiased bg-[#faf9f6] text-[#071e1b] selection:bg-[#071e1b] selection:text-[#faf9f6]">
        {children}
      </body>
    </html>
  );
}
