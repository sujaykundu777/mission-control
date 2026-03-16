"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Client } from "@/lib/types";
import { storage } from "@/lib/storage";
import { ClientsTable } from "./clients-table";
import Link from "next/link";

export function AllClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const allClients = storage.getClients();
    setClients(allClients);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const stats = storage.getClientStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-2">
            {" "}
            {stats.totalClients} total • {stats.activeClients} active
          </p>
        </div>
        <Link href="/clients/add">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </Link>
      </div>

      <ClientsTable
        clients={clients}
        onClientsChange={() => setClients(storage.getClients())}
      />
    </div>
  );
}
