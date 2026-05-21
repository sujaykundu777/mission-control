import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: 'ContactOS - Privacy-First Contact Management',
  description: 'Powerful, AI-driven offline-first contact management platform. Manage relationships, automate workflows, and never miss important moments.',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
