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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <RocketIcon className="h-5 w-5 text-primary-foreground" />
          </div> */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            {/* <Users className="w-5 h-5 text-primary" /> */}
            <RocketIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-sidebar-foreground">ContactOS</h1>
            <p className="text-xs text-sidebar-foreground/60">Your smart contact manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive("/dashboard") &&
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
        </Link>

        <Link href="/contacts">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive("/contacts") &&
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
            )}
          >
            <Users className="h-5 w-5" />
            Contacts
          </Button>
        </Link>

        <Link href="/domains">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive("/domains") &&
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
            )}
          >
            <Globe className="h-5 w-5" />
            Domains
          </Button>
        </Link>

        <Link href="/profile">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive("/profile") &&
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
            )}
          >
            <User className="h-5 w-5" />
            Profile
          </Button>
        </Link>

        {session?.user?.role === "superadmin" && (
          <Link href="/admin">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive("/admin") &&
                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
              )}
            >
              <Shield className="h-5 w-5" />
              Admin
            </Button>
          </Link>
        )}
      </nav>

      {/* User & Settings */}
      <div className="space-y-2 border-t border-sidebar-border p-4">
        {session?.user && (
          <div className="mb-2 px-3 py-2">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {session.user.name || session.user.email}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">{session.user.email}</p>
          </div>
        )}
      </div>
      {/* Settings */}
      <div className="border-t border-sidebar-border p-4">
        <Link href="/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive("/settings") &&
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
