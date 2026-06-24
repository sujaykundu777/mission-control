"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Globe,
  Settings,
  LayoutDashboard,
  Users,
  RocketIcon,
  User,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isCollapsed, toggleSidebar } = useSidebarContext();

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
            <RocketIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <h1 className="truncate text-lg font-bold text-sidebar-foreground">ContactOS</h1>
              <p className="truncate text-xs text-sidebar-foreground/60">
                Your smart contact manager
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <SidebarLink
          href="/dashboard"
          icon={<LayoutDashboard className="h-5 w-5" />}
          text="Dashboard"
          isActive={isActive("/dashboard")}
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/contacts"
          icon={<Users className="h-5 w-5" />}
          text="Contacts"
          isActive={isActive("/contacts")}
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/domains"
          icon={<Globe className="h-5 w-5" />}
          text="Domains"
          isActive={isActive("/domains")}
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/profile"
          icon={<User className="h-5 w-5" />}
          text="Profile"
          isActive={isActive("/profile")}
          isCollapsed={isCollapsed}
        />
        {session?.user?.role === "superadmin" && (
          <SidebarLink
            href="/admin"
            icon={<Shield className="h-5 w-5" />}
            text="Admin"
            isActive={isActive("/admin")}
            isCollapsed={isCollapsed}
          />
        )}
      </nav>

      {/* User & Settings */}
      {/* <div className="space-y-2 border-t border-sidebar-border p-4">
        {!isCollapsed && session?.user && (
          <div className="mb-2 px-3 py-2">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {session.user.name || session.user.email}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">{session.user.email}</p>
          </div>
        )}
      </div> */}

      <div className="border-t border-sidebar-border p-4">
        <SidebarLink
          href="/settings"
          icon={<Settings className="h-5 w-5" />}
          text="Settings"
          isActive={isActive("/settings")}
          isCollapsed={isCollapsed}
        />
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center px-0",
          )}
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <div className="flex justify-center border-t border-sidebar-border p-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  text,
  isActive,
  isCollapsed,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
          isCollapsed && "justify-center px-0",
        )}
      >
        {icon}
        {!isCollapsed && text}
      </Button>
    </Link>
  );
}
