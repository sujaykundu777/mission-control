"use client";

import Link from "next/link";
import { Service } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { useRouter } from "next/navigation";

interface ServicesListProps {
  services: Service[];
  domainId: string;
}

const SERVICE_ICONS: Record<string, string> = {
  hosting: "🏢",
  ssl: "🔒",
  email: "📧",
  cdn: "⚡",
  backup: "💾",
  monitoring: "📊",
  other: "📌",
};

export function ServicesList({ services, domainId }: ServicesListProps) {
  const router = useRouter();

  const handleDelete = (serviceId: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      const domain = storage.getDomainById(domainId);
      if (domain) {
        const updatedServices = domain.services.filter((s) => s.id !== serviceId);
        storage.updateDomain(domainId, { services: updatedServices });
        router.refresh();
      }
    }
  };

  if (services.length === 0) {
    return (
      <Card className="border-border bg-card p-12 text-center">
        <p className="mb-4 text-muted-foreground">No services added yet</p>
        <Link href={`/domains/${domainId}/services/add`}>
          <Button className="bg-primary hover:bg-primary/90">Add First Service</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card key={service.id} className="border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl">{SERVICE_ICONS[service.type]}</span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
                    {service.provider && ` • ${service.provider}`}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">STATUS</p>
                  <div className="mt-1">
                    <Badge
                      variant={service.status === "active" ? "default" : "secondary"}
                      className={
                        service.status === "active"
                          ? "bg-green-500/20 text-green-300"
                          : service.status === "expired"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-gray-500/20 text-gray-300"
                      }
                    >
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">BILLING</p>
                  <p className="mt-1 text-sm text-foreground">
                    {service.billingCycle.charAt(0).toUpperCase() + service.billingCycle.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">COST</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">${service.cost}</p>
                </div>
                {service.renewalDate && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">RENEWAL</p>
                    <p className="mt-1 text-sm text-foreground">
                      {new Date(service.renewalDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {service.notes && (
                <div className="mt-3 rounded bg-secondary p-3 text-sm text-muted-foreground">
                  {service.notes}
                </div>
              )}
            </div>

            <div className="ml-4 flex gap-2">
              <Link href={`/domains/${domainId}/services/${service.id}/edit`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(service.id)}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
