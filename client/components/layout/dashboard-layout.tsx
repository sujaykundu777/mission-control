"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "./sidebar-context";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background text-foreground">
          <Sidebar />
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
          <Toaster />
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  return (
    <div className={cn("flex flex-1 flex-col transition-all duration-300")}>
      <TopNav />
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
