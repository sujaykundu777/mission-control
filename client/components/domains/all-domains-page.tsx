"use client";

import { useEffect, useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { Domain } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { DomainsList } from "@/components/dashboard/domains-list";

export function AllDomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "pending">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Paint from the local cache immediately, then reconcile with the
      // server in the background once that resolves (or fails offline).
      const localDomains = storage.getDomains();
      setDomains(localDomains);
      setIsLoading(false);

      const mergedDomains = await storage.refreshDomainsFromServer();
      setDomains(mergedDomains);
    };
    load();
  }, []);

  const filteredDomains = useMemo(() => {
    let filtered = domains;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) => d.name.toLowerCase().includes(term) || d.registrar.toLowerCase().includes(term),
      );
    }
    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        filtered = filtered.filter((d) => d.status === "pending-renewal");
      } else {
        filtered = filtered.filter((d) => d.status === statusFilter);
      }
    }
    return filtered;
  }, [domains, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Domains</h1>
          <p className="mt-2 text-muted-foreground">{domains.length} total domains</p>
        </div>
        <Link href="/domains/add">
          <Button className="bg-primary hover:bg-primary/90">Add Domain</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-64 flex-1">
            <search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search domains or registrars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-border bg-card pl-10"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "active", "expired", "pending"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
                className={
                  statusFilter === status
                    ? "bg-primary hover:bg-primary/90"
                    : "border-border hover:bg-card"
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredDomains.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Settings2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">No domains found</h3>
          <p className="mb-6 text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by adding your first domain"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Link href="/domains/add">
              <Button>Add Your First Domain</Button>
            </Link>
          )}
        </div>
      ) : (
        <DomainsList domains={filteredDomains} />
      )}
    </div>
  );
}
