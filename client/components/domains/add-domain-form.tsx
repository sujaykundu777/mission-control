"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Domain, ContactInfo, Client } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { CURRENCIES } from "@/lib/currency";
import { ClientSelectorDialog } from '@/components/clients/client-selector-dialog'

export function AddDomainForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showClientSelector, setShowClientSelector] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    registrar: "Hostinger" as const,
    purchaseDate: new Date().toISOString().split("T")[0],
    expirationDate: "",
    renewalPrice: 0,
    renewalCurrency: "",
    autoRenew: true,
    registrarUrl: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    notes: ""
  });

  const registrars = ["Hostinger", "GoDaddy", "Namecheap", "other"];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    console.log("name", name);
    console.log("value", value);
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
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
      const contactInfo: ContactInfo = {
        id: `contact-${Date.now()}`,
        name: formData.contactName,
        email: formData.contactEmail,
        phone: formData.contactPhone,
      };

      const newDomain: Domain = {
        id: `domain-${Date.now()}`,
        name: formData.name.toLowerCase(),
        registrar: formData.registrar as
          | "Hostinger"
          | "GoDaddy"
          | "Namecheap"
          | "other",
        registrarUrl: formData.registrarUrl,
        purchaseDate: formData.purchaseDate,
        expirationDate: formData.expirationDate,
        renewalPrice: parseFloat(formData.renewalPrice.toString()),
        renewalCurrency: formData.renewalCurrency,
        autoRenew: formData.autoRenew,
        status: "active",
        services: [],
        dnsRecords: [],
        contactInfo,
        clientId: selectedClient?.id,
        notes: formData.notes,
      };

      storage.addDomain(newDomain);
      router.push(`/domains/${newDomain.id}`);
    } catch (error) {
      console.error("[v0] Error adding domain:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/domains">
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Domains
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Add New Domain</h1>
        <p className="text-muted-foreground mt-2">
          Register and manage your domain information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Domain Information */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Domain Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Domain Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  placeholder="example.com"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Registrar *
                </label>
                <select
                  name="registrar"
                  value={formData.registrar}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground"
                >
                  {registrars.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Purchase Date *
                </label>
                <Input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expiration Date *
                </label>
                <Input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  required
                  className="bg-secondary border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Renewal Currency
                </label>

                <select
                  name="renewalCurrency"
                  value={formData.renewalCurrency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.id} value={currency.name}>
                      {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Renewal Price
                </label>

                <Input
                  type="number"
                  name="renewalPrice"
                  placeholder="9.99"
                  value={formData.renewalPrice}
                  onChange={handleChange}
                  step="0.01"
                  required
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Registrar URL
                </label>
                <Input
                  type="url"
                  name="registrarUrl"
                  placeholder="https://..."
                  value={formData.registrarUrl}
                  onChange={handleChange}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="autoRenew"
                checked={formData.autoRenew}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <label className="text-sm font-medium text-foreground">
                Enable Auto-Renewal
              </label>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contact Name *
              </label>
              <Input
                type="text"
                name="contactName"
                placeholder="John Doe"
                value={formData.contactName}
                onChange={handleChange}
                required
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  name="contactEmail"
                  placeholder="john@example.com"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone
                </label>
                <Input
                  type="tel"
                  name="contactPhone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </Card>

         {/* Associated Client */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Associate Client (Optional)</h2>
          {selectedClient ? (
            <div className="flex items-center justify-between p-3 bg-background border border-border rounded-md">
              <div>
                <p className="font-semibold text-foreground">{selectedClient.name}</p>
                <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedClient(null)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full border-border"
              onClick={() => setShowClientSelector(true)}
            >
              Select a Client
            </Button>
          )}
        </Card>


        {/* Additional Notes */}
        <Card className="p-6 bg-card border-border">
          <label className="block text-sm font-medium text-foreground mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            placeholder="Add any additional notes about this domain..."
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Adding..." : "Add Domain"}
          </Button>
          <Link href="/domains">
            <Button variant="outline" className="border-border hover:bg-card">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
      {/* Client Selector Dialog */}
      <ClientSelectorDialog
        open={showClientSelector}
        onOpenChange={setShowClientSelector}
        onSelect={setSelectedClient}
      />
    </div>
  );
}
