import type { Metadata, Viewport } from "next";
import "../globals.css";
import { SessionProvider } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const metadata: Metadata = {
  title: "ContactOS - Privacy-First Contact Management",
  description:
    "Powerful, AI-driven offline-first contact management platform. Manage relationships, automate workflows, and never miss important moments.",
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
    <SessionProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </SessionProvider>
  );
}
