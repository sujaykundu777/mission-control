"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Domain, Client, Contact } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CURRENCY_SYMBOLS } from "@/lib/currency";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { ServicesList } from "./services-list";
import { DNSRecordsList } from "./dns-records-list";

interface DomainDetailPageProps {
  domainId: string;
}

export function DomainDetailPage({ domainId }: DomainDetailPageProps) {
  const router = useRouter();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const foundDomain = storage.getDomainById(domainId);
      setDomain(foundDomain);

      if (foundDomain?.contactId) {
        const foundContact = await storage.getContactById(foundDomain.contactId);
        setContact(foundContact);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [domainId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="space-y-6">
        <Link href="/domains">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Domains
          </Button>
        </Link>
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Domain not found
          </h3>
          <p className="text-muted-foreground">
            The domain you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const getDaysUntilExpiry = (expirationDate: string) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntilExpiry = getDaysUntilExpiry(domain.expirationDate);
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this domain?")) {
      setIsDeleting(true);
      storage.deleteDomain(domain.id);
      router.push("/domains");
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

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {domain.name}
              </h1>
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
            <p className="text-muted-foreground">
              {domain.registrar} • Expires in {daysUntilExpiry} days
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={`/domains/${domain.id}/edit`}>
              <Button variant="outline" className="border-border hover:bg-card">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {isExpiringSoon && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-yellow-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            This domain expires soon. Auto-renewal is{" "}
            {domain.autoRenew ? "enabled" : "disabled"}.
          </p>
        </div>
      )}

      {domain.status === "expired" && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            This domain has expired. Please renew it as soon as possible.
          </p>
        </div>
      )}

      {/* Domain Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Domain Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                REGISTRAR
              </p>
              <p className="text-foreground mt-1">
                {domain.registrarUrl ? (
                  <a
                    href={domain.registrarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {domain.registrar} ↗
                  </a>
                ) : (
                  domain.registrar
                )}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                PURCHASED
              </p>
              <p className="text-foreground mt-1">
                {new Date(domain.purchaseDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                EXPIRATION DATE
              </p>
              <p className="text-foreground mt-1">
                {new Date(domain.expirationDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                RENEWAL PRICE
              </p>
              <p className="text-foreground mt-1">
                {domain.renewalCurrency
                  ? CURRENCY_SYMBOLS[domain.renewalCurrency]
                  : "NA"}{" "}
                {domain.renewalPrice}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                AUTO-RENEWAL
              </p>
              <p className="text-foreground mt-1 flex items-center gap-2">
                {domain.autoRenew ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Enabled
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    Disabled
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">NAME</p>
              <p className="text-foreground mt-1">{domain.contactInfo.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">EMAIL</p>
              <p className="text-foreground mt-1">
                <a
                  href={`mailto:${domain.contactInfo.email}`}
                  className="text-primary hover:underline"
                >
                  {domain.contactInfo.email}
                </a>
              </p>
            </div>
            {domain.contactInfo.phone && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  PHONE
                </p>
                <p className="text-foreground mt-1">
                  {domain.contactInfo.phone}
                </p>
              </div>
            )}
            {domain.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  NOTES
                </p>
                <p className="text-foreground mt-1 text-sm">{domain.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {
          contact && (
              <Card className="p-6 bg-card border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Associated Contact</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">CONTACT NAME</p>
                    <Link href={`/contacts/${contact.id}`}>
                      <p className="text-primary hover:underline mt-1">{contact.name}</p>
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">EMAIL</p>
                    <p className="text-foreground mt-1">
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                        {contact.email}
                      </a>
                    </p>
                  </div>
                  {contact.company && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">COMPANY</p>
                      <p className="text-foreground mt-1">{contact.company}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <Link href={`/domains/${domain.id}/edit`}>
                      <Button size="sm" variant="outline" className="border-border">
                        Change Client
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
          )
        }
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Services</h2>
          <Link href={`/domains/${domain.id}/services/add`}>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </Link>
        </div>
        <ServicesList services={domain.services} domainId={domain.id} />
      </div>

      {/* DNS Records */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">DNS Records</h2>
          <Link href={`/domains/${domain.id}/dns/add`}>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </Link>
        </div>
        <DNSRecordsList records={domain.dnsRecords} domainId={domain.id} />
      </div>
    </div>
  );
}
