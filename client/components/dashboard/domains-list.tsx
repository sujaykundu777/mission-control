"use client";

import Link from "next/link";
import { Domain } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { CURRENCY_SYMBOLS } from "@/lib/currency";

interface DomainsListProps {
  domains: Domain[];
}

export function DomainsList({ domains }: DomainsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "pending-renewal":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getDaysUntilExpiry = (expirationDate: string) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-4">
      {domains.map((domain) => {
        const daysUntilExpiry = getDaysUntilExpiry(domain.expirationDate);
        const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

        return (
          <Link href={`/domains/${domain.id}`} key={domain.id}>
            <Card className="cursor-pointer border-border bg-card p-6 transition-colors hover:bg-card/80">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{domain.name}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(domain.status)}
                      <Badge
                        variant={
                          domain.status === "active"
                            ? "default"
                            : domain.status === "expired"
                              ? "destructive"
                              : "secondary"
                        }
                        className={
                          domain.status === "active"
                            ? "bg-green-500/20 text-green-300"
                            : domain.status === "expired"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                        }
                      >
                        {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">REGISTRAR</p>
                      <p className="mt-1 text-foreground">{domain.registrar}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">EXPIRES IN</p>
                      <p className="mt-1 text-foreground">
                        {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : "Expired"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">SERVICES</p>
                      <p className="mt-1 text-foreground">{domain.services.length}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">RENEWAL COST</p>
                      <p className="mt-1 text-foreground">
                        {CURRENCY_SYMBOLS[domain.renewalCurrency || "INR"]} {domain.renewalPrice}
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" className="ml-4 text-primary hover:text-primary/80">
                  View Details →
                </Button>
              </div>

              {isExpiringSoon && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm text-yellow-400">
                    ⚠️ This domain expires soon. Auto-renewal is{" "}
                    {domain.autoRenew ? "enabled" : "disabled"}.
                  </p>
                </div>
              )}
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
