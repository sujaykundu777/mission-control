"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Service } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AddServiceFormProps {
  domainId: string;
  serviceId?: string;
  isEdit?: boolean;
}

const SERVICE_TYPES: Service["type"][] = [
  "hosting",
  "ssl",
  "email",
  "cdn",
  "backup",
  "monitoring",
  "other",
];
const BILLING_CYCLES: Service["billingCycle"][] = ["monthly", "annual", "one-time"];

export function AddServiceForm({ domainId, serviceId, isEdit = false }: AddServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const domain = storage.getDomainById(domainId);
  const existingService =
    isEdit && serviceId ? domain?.services.find((s) => s.id === serviceId) : null;

  const [formData, setFormData] = useState({
    name: existingService?.name || "",
    type: (existingService?.type || "hosting") as Service["type"],
    provider: existingService?.provider || "",
    status: (existingService?.status || "active") as Service["status"],
    billingCycle: (existingService?.billingCycle || "annual") as Service["billingCycle"],
    cost: existingService?.cost || 0,
    renewalDate: existingService?.renewalDate || "",
    notes: existingService?.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cost" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!domain) throw new Error("Domain not found");

      if (isEdit && serviceId) {
        // Update existing service
        const updatedServices = domain.services.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                name: formData.name,
                type: formData.type,
                provider: formData.provider,
                status: formData.status,
                billingCycle: formData.billingCycle,
                cost: formData.cost,
                renewalDate: formData.renewalDate,
                notes: formData.notes,
              }
            : s,
        );
        storage.updateDomain(domainId, { services: updatedServices });
      } else {
        // Add new service
        const newService: Service = {
          id: `service-${Date.now()}`,
          name: formData.name,
          type: formData.type,
          provider: formData.provider,
          status: formData.status,
          billingCycle: formData.billingCycle,
          cost: formData.cost,
          renewalDate: formData.renewalDate,
          notes: formData.notes,
        };
        domain.services.push(newService);
        storage.updateDomain(domainId, { services: domain.services });
      }

      router.push(`/domains/${domainId}`);
    } catch (error) {
      console.error("Error saving service:", error);
      setIsSubmitting(false);
    }
  };

  if (!domain) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Domain not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href={`/domains/${domainId}`}>
          <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Domain
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">
          {isEdit ? "Edit Service" : "Add New Service"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {domain.name} • {isEdit ? "Update service details" : "Add a service to this domain"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Details */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Service Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Service Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  placeholder="e.g., Premium Hosting"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Service Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-foreground"
                >
                  {SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Provider</label>
                <Input
                  type="text"
                  name="provider"
                  placeholder="e.g., Bluehost, Namecheap"
                  value={formData.provider}
                  onChange={handleChange}
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-foreground"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Billing Cycle *
                </label>
                <select
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleChange}
                  className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-foreground"
                >
                  {BILLING_CYCLES.map((cycle) => (
                    <option key={cycle} value={cycle}>
                      {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Cost ($) *</label>
                <Input
                  type="number"
                  name="cost"
                  placeholder="9.99"
                  value={formData.cost}
                  onChange={handleChange}
                  step="0.01"
                  required
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Renewal Date
                </label>
                <Input
                  type="date"
                  name="renewalDate"
                  value={formData.renewalDate}
                  onChange={handleChange}
                  className="border-border bg-secondary text-foreground"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="border-border bg-card p-6">
          <label className="mb-2 block text-sm font-medium text-foreground">Notes</label>
          <textarea
            name="notes"
            placeholder="Add any additional notes about this service..."
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Adding..."
              : isEdit
                ? "Update Service"
                : "Add Service"}
          </Button>
          <Link href={`/domains/${domainId}`}>
            <Button variant="outline" className="border-border hover:bg-card">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
