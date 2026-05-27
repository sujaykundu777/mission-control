"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserTable } from "@/components/admin/user-table";
import { Shield } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (session?.user?.role !== "superadmin") {
    router.push("/");
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <p className="mb-6 text-muted-foreground">Manage users and their roles.</p>
      <UserTable />
    </div>
  );
}
