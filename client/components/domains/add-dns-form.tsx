"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DNSRecord } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AddDNSFormProps {
  domainId: string;
  recordId?: string;
  isEdit?: boolean;
}

const DNS_TYPES: DNSRecord["type"][] = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "SRV"];

export function AddDNSForm({ domainId, recordId, isEdit = false }: AddDNSFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const domain = storage.getDomainById(domainId);
  const existingRecord =
    isEdit && recordId ? domain?.dnsRecords.find((r) => r.id === recordId) : null;

  const [formData, setFormData] = useState({
    type: (existingRecord?.type || "A") as DNSRecord["type"],
    name: existingRecord?.name || "",
    value: existingRecord?.value || "",
    ttl: existingRecord?.ttl || 3600,
    priority: existingRecord?.priority || undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "ttl" || name === "priority") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!domain) throw new Error("Domain not found");

      if (isEdit && recordId) {
        // Update existing record
        const updatedRecords = domain.dnsRecords.map((r) =>
          r.id === recordId
            ? {
                ...r,
                type: formData.type,
                name: formData.name,
                value: formData.value,
                ttl: formData.ttl,
                priority: formData.priority,
              }
            : r,
        );
        storage.updateDomain(domainId, { dnsRecords: updatedRecords });
      } else {
        // Add new record
        const newRecord: DNSRecord = {
          id: `dns-${Date.now()}`,
          type: formData.type,
          name: formData.name,
          value: formData.value,
          ttl: formData.ttl,
          priority: formData.priority,
        };
        domain.dnsRecords.push(newRecord);
        storage.updateDomain(domainId, { dnsRecords: domain.dnsRecords });
      }

      router.push(`/domains/${domainId}`);
    } catch (error) {
      console.error("Error saving DNS record:", error);
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
          {isEdit ? "Edit DNS Record" : "Add DNS Record"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {domain.name} • {isEdit ? "Update DNS record" : "Add a new DNS record"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* DNS Record Details */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">DNS Record Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Record Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-foreground"
                >
                  {DNS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Record Name
                </label>
                <Input
                  type="text"
                  name="name"
                  placeholder="@ or subdomain (e.g., www, mail)"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Value *</label>
              <Input
                type="text"
                name="value"
                placeholder="Record value (e.g., IP address, CNAME, etc.)"
                value={formData.value}
                onChange={handleChange}
                required
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  TTL (Time to Live)
                </label>
                <Input
                  type="number"
                  name="ttl"
                  placeholder="3600"
                  value={formData.ttl}
                  onChange={handleChange}
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Priority (for MX records)
                </label>
                <Input
                  type="number"
                  name="priority"
                  placeholder="10"
                  value={formData.priority || ""}
                  onChange={handleChange}
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Info */}
        <div className="rounded-lg border border-border bg-secondary/50 p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Tip:</span> Make sure to update these records with your
            domain registrar for them to take effect. Keep the TTL value between 300-3600 seconds
            for most use cases.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Adding..."
              : isEdit
                ? "Update Record"
                : "Add Record"}
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
