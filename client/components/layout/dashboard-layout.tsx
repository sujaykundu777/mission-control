"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "./sidebar-context";
import { OnlineStatusProvider } from "@/components/online-status-provider";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SessionProvider>
      <OnlineStatusProvider>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar />
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
            <Toaster />
          </div>
        </SidebarProvider>
      </OnlineStatusProvider>
    </SessionProvider>
  );
}

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden transition-all duration-300")}>
      <TopNav />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
