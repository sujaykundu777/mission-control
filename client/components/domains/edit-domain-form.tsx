"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Domain, ContactInfo, Client, Contact} from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { CURRENCIES, Currency } from "@/lib/currency";
import { ContactSelectorDialog } from '@/components/contacts/contact-selector-dialog'

interface EditDomainFormProps {
  domainId: string;
}

export function EditDomainForm({ domainId }: EditDomainFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showClientSelector, setShowClientSelector] = useState(false)

  const [formData, setFormData] = useState({
    registrarUrl: "",
    autoRenew: true,
    renewalPrice: 0,
    renewalCurrency: "INR" as Currency,
    expirationDate: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
  });

  // const registrars = ["Hostinger", "GoDaddy", "Namecheap", "other"];

  useEffect(() => {
    const loadDomain = async () => {
      const foundDomain = storage.getDomainById(domainId);
      if (foundDomain) {
        setDomain(foundDomain);
        setFormData({
          registrarUrl: foundDomain.registrarUrl || "",
          autoRenew: foundDomain.autoRenew,
          renewalPrice: foundDomain.renewalPrice,
          renewalCurrency: (foundDomain.renewalCurrency || "INR") as Currency,
          expirationDate: foundDomain.expirationDate,
          contactName: foundDomain.contactInfo.name,
          contactEmail: foundDomain.contactInfo.email,
          contactPhone: foundDomain.contactInfo.phone || "",
          notes: foundDomain.notes || "",
        });
        if (foundDomain.contactId) {
          const foundContact = await storage.getContactById(foundDomain.contactId);
          setSelectedContact(foundContact);
        }
      }
    };
    loadDomain();
  }, [domainId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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
      if (!domain) throw new Error("Domain not found");

      const updatedContact: ContactInfo = {
        ...domain.contactInfo,
        name: formData.contactName,
        email: formData.contactEmail,
        phone: formData.contactPhone,
      };

      storage.updateDomain(domainId, {
        registrarUrl: formData.registrarUrl,
        autoRenew: formData.autoRenew,
        renewalPrice: parseFloat(formData.renewalPrice.toString()),
        renewalCurrency: formData.renewalCurrency,
        expirationDate: formData.expirationDate,
        contactInfo: updatedContact,
        contactId: selectedContact?.id,
        notes: formData.notes,
      });

      router.push(`/domains/${domainId}`);
    } catch (error) {
      console.error("Error updating domain:", error);
      setIsSubmitting(false);
    }
  };

  if (!domain) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href={`/domains/${domainId}`}>
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Domain
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Edit Domain</h1>
        <p className="text-muted-foreground mt-2">
          {domain.name} • Update domain details
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
                  Domain Name
                </label>
                <Input
                  type="text"
                  value={domain.name}
                  disabled
                  className="bg-secondary border-border text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Registrar
                </label>
                <Input
                  type="text"
                  value={domain.registrar}
                  disabled
                  className="bg-secondary border-border text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Renewal Currency{" "}
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
                    Renewal Price{" "}
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
            </div>

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
          {selectedContact ? (
            <div className="flex items-center justify-between p-3 bg-background border border-border rounded-md">
              <div>
                <p className="font-semibold text-foreground">{selectedContact.name}</p>
                <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border"
                  onClick={() => setShowClientSelector(true)}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedContact(null)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
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
            {isSubmitting ? "Updating..." : "Update Domain"}
          </Button>
          <Link href={`/domains/${domainId}`}>
            <Button variant="outline" className="border-border hover:bg-card">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      {/* Client Selector Dialog */}
      <ContactSelectorDialog
        open={showClientSelector}
        onOpenChange={setShowClientSelector}
        onSelect={setSelectedContact}
      />
    </div>
  );
}
