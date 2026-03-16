"use client";

import { useEffect, useState } from "react";
import { Globe, Server, AlertCircle, Zap, Users } from "lucide-react";
import { StatCard } from "./stat-card";
import { DomainsList } from "./domains-list";
import { storage } from "@/lib/storage";
import { Domain } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalDomains: 0,
    activeDomains: 0,
    expiredDomains: 0,
    totalServices: 0,
    totalCosts: 0,
  });

  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    archivedClients: 0,
  });

  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const allDomains = storage.getDomains();
    const calculatedStats = storage.getStats();
    const calculatedClientStats = storage.getClientStats();
    setDomains(allDomains);
    setStats(calculatedStats);
    setClientStats(calculatedClientStats);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor all your domains and clients
          </p>
        </div>
        <Link href="/domains/add">
          <Button className="bg-primary hover:bg-primary/90">Add Domain</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Clients"
          value={clientStats.totalClients}
          icon={<Users className="w-6 h-6" />}
          description={`${clientStats.activeClients} active`}
        />
        <StatCard
          title="Total Domains"
          value={stats.totalDomains}
          icon={<Globe className="w-6 h-6" />}
          description={`${stats.activeDomains} active`}
        />
        <StatCard
          title="Active Domains"
          value={stats.activeDomains}
          icon={<Zap className="w-6 h-6" />}
          description="Ready to use"
        />
        <StatCard
          title="Expired Domains"
          value={stats.expiredDomains}
          icon={<AlertCircle className="w-6 h-6" />}
          description="Need renewal"
          className={stats.expiredDomains > 0 ? "border-destructive/50" : ""}
        />
        <StatCard
          title="Services"
          value={stats.totalServices}
          icon={<Server className="w-6 h-6" />}
          description="Across all domains"
        />
      </div>

      {/* Recent Domains */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Domains</h2>
          {domains.length > 0 && (
            <Link href="/domains">
              <Button variant="outline">View All</Button>
            </Link>
          )}
        </div>
        {domains.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No domains yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Get started by adding your first domain
            </p>
            <Link href="/domains/add">
              <Button>Add Your First Domain</Button>
            </Link>
          </div>
        ) : (
          <DomainsList domains={domains.slice(0, 5)} />
        )}
      </div>
    </div>
  );
}
