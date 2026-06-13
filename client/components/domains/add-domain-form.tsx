"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Domain, ContactInfo, Contact } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { CURRENCIES } from "@/lib/currency";
import { ContactSelectorDialog } from "@/components/contacts/contact-selector-dialog";

export function AddDomainForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactSelector, setShowContactSelector] = useState(false);

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
    notes: "",
  });

  const registrars = ["Hostinger", "GoDaddy", "Namecheap", "other"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

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
        registrar: formData.registrar as "Hostinger" | "GoDaddy" | "Namecheap" | "other",
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
        contactId: selectedContact?.id,
        notes: formData.notes,
      };

      storage.addDomain(newDomain);
      router.push(`/domains/${newDomain.id}`);
    } catch (error) {
      console.error("Error adding domain:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/domains">
          <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Domains
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Add New Domain</h1>
        <p className="mt-2 text-muted-foreground">Register and manage your domain information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Domain Information */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Domain Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Domain Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  placeholder="example.com"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Registrar *
                </label>
                <select
                  name="registrar"
                  value={formData.registrar}
                  onChange={handleChange}
                  className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-foreground"
                >
                  {registrars.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Purchase Date *
                </label>
                <Input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="border-border bg-secondary text-foreground"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Expiration Date *
                </label>
                <Input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  required
                  className="border-border bg-secondary text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Renewal Currency
                </label>

                <select
                  name="renewalCurrency"
                  value={formData.renewalCurrency}
                  onChange={handleChange}
                  className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-foreground"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.id} value={currency.name}>
                      {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Registrar URL
                </label>
                <Input
                  type="url"
                  name="registrarUrl"
                  placeholder="https://..."
                  value={formData.registrarUrl}
                  onChange={handleChange}
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="autoRenew"
                checked={formData.autoRenew}
                onChange={handleChange}
                className="h-4 w-4 rounded"
              />
              <label className="text-sm font-medium text-foreground">Enable Auto-Renewal</label>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Contact Name *
              </label>
              <Input
                type="text"
                name="contactName"
                placeholder="John Doe"
                value={formData.contactName}
                onChange={handleChange}
                required
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Email *</label>
                <Input
                  type="email"
                  name="contactEmail"
                  placeholder="john@example.com"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Phone</label>
                <Input
                  type="tel"
                  name="contactPhone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Associated Contact */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Associate Contact (Optional)
          </h2>
          {selectedContact ? (
            <div className="flex items-center justify-between rounded-md border border-border bg-background p-3">
              <div>
                <p className="font-semibold text-foreground">{selectedContact.name}</p>
                <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedContact(null)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full border-border"
              onClick={() => setShowContactSelector(true)}
            >
              Select a Contact
            </Button>
          )}
        </Card>

        {/* Additional Notes */}
        <Card className="border-border bg-card p-6">
          <label className="mb-2 block text-sm font-medium text-foreground">Notes</label>
          <textarea
            name="notes"
            placeholder="Add any additional notes about this domain..."
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
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
      <ContactSelectorDialog
        open={showContactSelector}
        onOpenChange={setShowContactSelector}
        onSelect={setSelectedContact}
      />
    </div>
  );
}
