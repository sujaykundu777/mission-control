"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Toaster } from "@/components/ui/sonner";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="mb-24 ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <Toaster />
    </div>
  );
}
