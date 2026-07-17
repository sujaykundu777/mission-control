import { Contact, CustomField } from "@/lib/types";

// Fields accepted by app/api/contacts/route.ts and app/api/contacts/[id]/route.ts.
// Contact (lib/types.ts) has additional client-only fields - workEmail, workPhone,
// martialStatus, relationshipType, profileImage, address, summary - that aren't
// part of the Prisma `Contact` model yet, so they're intentionally left out of
// the network payload until the schema/API is extended to support them.
export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  website?: string;
  billingAddress?: string;
  billingEmail?: string;
  billingPhone?: string;
  status?: string;
  customFields?: CustomField[];
  notes?: string;
}

function toPayload(contact: Partial<Contact>): ContactPayload {
  return {
    name: contact.name ?? "",
    email: contact.email ?? "",
    phone: contact.phone,
    gender: contact.gender,
    dob: contact.dob,
    jobTitle: contact.jobTitle,
    company: contact.company,
    industry: contact.industry,
    website: contact.website,
    billingAddress: contact.billingAddress,
    billingEmail: contact.billingEmail,
    billingPhone: contact.billingPhone,
    status: contact.status,
    customFields: contact.customFields,
    notes: contact.notes,
  };
}

async function throwOnError(response: Response, action: string): Promise<never> {
  const body = await response.json().catch(() => ({}));
  throw new Error(`${action} failed: ${response.status} ${body.error ?? response.statusText}`);
}

export async function fetchAllContactsApi(): Promise<Contact[]> {
  const response = await fetch("/api/contacts", { method: "GET" });
  if (!response.ok) return throwOnError(response, "Fetch contacts");
  return response.json();
}

export async function createContactApi(contact: Partial<Contact>): Promise<Contact> {
  const response = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(contact)),
  });
  if (!response.ok) return throwOnError(response, "Create contact");
  return response.json();
}

export async function updateContactApi(id: string, contact: Partial<Contact>): Promise<Contact> {
  const response = await fetch(`/api/contacts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(contact)),
  });
  if (!response.ok) return throwOnError(response, "Update contact");
  return response.json();
}

export async function deleteContactApi(id: string): Promise<void> {
  const response = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) await throwOnError(response, "Delete contact");
}
