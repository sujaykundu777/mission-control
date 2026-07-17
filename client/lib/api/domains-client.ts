import { Domain } from "@/lib/types";

// Fields accepted by app/api/domains/route.ts and app/api/domains/[id]/route.ts.
export interface DomainPayload {
  name: string;
  registrar: string;
  registrarUrl?: string;
  purchaseDate: string;
  expirationDate: string;
  renewalPrice: number;
  renewalCurrency?: string;
  autoRenew?: boolean;
  status?: string;
  services?: Domain["services"];
  dnsRecords?: Domain["dnsRecords"];
  contactInfo?: Domain["contactInfo"];
  notes?: string;
  currency?: string;
  contactId?: string;
}

function toPayload(domain: Partial<Domain>): DomainPayload {
  return {
    name: domain.name ?? "",
    registrar: domain.registrar ?? "other",
    registrarUrl: domain.registrarUrl,
    purchaseDate: domain.purchaseDate ?? "",
    expirationDate: domain.expirationDate ?? "",
    renewalPrice: domain.renewalPrice ?? 0,
    renewalCurrency: domain.renewalCurrency,
    autoRenew: domain.autoRenew,
    status: domain.status,
    services: domain.services,
    dnsRecords: domain.dnsRecords,
    contactInfo: domain.contactInfo,
    notes: domain.notes,
    currency: domain.currency,
    contactId: domain.contactId,
  };
}

async function throwOnError(response: Response, action: string): Promise<never> {
  const body = await response.json().catch(() => ({}));
  throw new Error(`${action} failed: ${response.status} ${body.error ?? response.statusText}`);
}

export async function fetchAllDomainsApi(): Promise<Domain[]> {
  const response = await fetch("/api/domains", { method: "GET" });
  if (!response.ok) return throwOnError(response, "Fetch domains");
  return response.json();
}

export async function createDomainApi(domain: Partial<Domain>): Promise<Domain> {
  const response = await fetch("/api/domains", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(domain)),
  });
  if (!response.ok) return throwOnError(response, "Create domain");
  return response.json();
}

export async function updateDomainApi(id: string, domain: Partial<Domain>): Promise<Domain> {
  const response = await fetch(`/api/domains/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(domain)),
  });
  if (!response.ok) return throwOnError(response, "Update domain");
  return response.json();
}

export async function deleteDomainApi(id: string): Promise<void> {
  const response = await fetch(`/api/domains/${id}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) await throwOnError(response, "Delete domain");
}
