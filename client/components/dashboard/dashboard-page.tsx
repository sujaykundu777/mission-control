"use client";

import { useEffect, useState } from "react";
import { Globe, Server, AlertCircle, Zap, Users,  } from "lucide-react";
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

  // const [clientStats, setClientStats] = useState({
  //   totalClients: 0,
  //   activeClients: 0,
  //   inactiveClients: 0,
  //   archivedClients: 0,
  // });

  const [contactStats, setContactStats] = useState({
    totalContacts: 0,
    activeContacts: 0,
    inactiveContacts: 0,
    archivedContacts: 0,
  });

  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const allDomains = storage.getDomains();
      const calculatedStats = storage.getStats();
      const calculatedContactStats = await storage.getContactsStats();
      setDomains(allDomains);
      setStats(calculatedStats);
      setContactStats(calculatedContactStats);
      setIsLoading(false);
    };
    loadData();
  }, []);

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
          <h1 className="text-3xl font-bold text-foreground">Welcome Sujay <span className="animate-waveMe md:mt-20 text-3xl">👋</span></h1>
          <p className="mt-2 text-muted-foreground">Manage and monitor all your activities</p>
        </div>
        <Link href="/domains/add">
          <Button className="bg-primary hover:bg-primary/90">Add Domain</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Contacts"
          value={contactStats.totalContacts}
          icon={<Users className="h-6 w-6" />}
          description={`${contactStats.activeContacts} active`}
        />
        <StatCard
          title="Total Domains"
          value={stats.totalDomains}
          icon={<Globe className="h-6 w-6" />}
          description={`${stats.activeDomains} active`}
        />
        <StatCard
          title="Active Domains"
          value={stats.activeDomains}
          icon={<Zap className="h-6 w-6" />}
          description="Ready to use"
        />
        <StatCard
          title="Expired Domains"
          value={stats.expiredDomains}
          icon={<AlertCircle className="h-6 w-6" />}
          description="Need renewal"
          className={stats.expiredDomains > 0 ? "border-destructive/50" : ""}
        />
        <StatCard
          title="Services"
          value={stats.totalServices}
          icon={<Server className="h-6 w-6" />}
          description="Across all domains"
        />
      </div>

      {/* Recent Domains */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Upcoming Renewals</h2>
          {domains.length > 0 && (
            <Link href="/domains">
              <Button variant="outline">View All</Button>
            </Link>
          )}
        </div>
        {domains.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <Globe className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">No domains yet</h3>
            <p className="mb-6 text-muted-foreground">Get started by adding your first domain</p>
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
