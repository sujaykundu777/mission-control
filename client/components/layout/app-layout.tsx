"use client";

import { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
 
    <div className=" text-foreground">
       <main>      
        {children}
      </main>

      <Toaster />
    </div>
    
  );
}
