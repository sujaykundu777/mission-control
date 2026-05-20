"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { UserTable } from "@/components/admin/user-table"
import { Shield } from "lucide-react"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    )
  }

  if (session?.user?.role !== "superadmin") {
    router.push("/")
    return null
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Manage users and their roles.
        </p>
        <UserTable />
      </div>
    </AppLayout>
  )
}
