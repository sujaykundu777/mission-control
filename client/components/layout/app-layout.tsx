'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Toaster } from "@/components/ui/sonner"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 mb-24">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

        <Toaster />
    </div>
  )
}
