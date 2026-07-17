import type { Metadata, Viewport } from "next";

import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  title: "ContactOS - Privacy-First Contact Management",
  description:
    "Powerful, AI-driven offline-first contact management platform. Manage relationships, automate workflows, and never miss important moments.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-background font-sans text-foreground antialiased">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
