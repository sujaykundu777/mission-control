export interface CustomField {
  key: string;
  value: string;
}

export interface Contact {
  id: string;
  contactId: string;
  summary?: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  relationshipType?: string;
  dob?: string;
  address?: string;
  jobTitle?: string;
  martialStatus?: "Single" | "Married" | "Divorce" | "Widowed";
  company?: string;
  workEmail?: string;
  workPhone?: string;
  industry?: string;
  website?: string;
  billingAddress?: string;
  billingEmail?: string;
  billingPhone?: string;
  status: "active" | "inactive" | "archived";
  customFields: CustomField[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: "synced" | "pending" | "syncing" | "failed";
}

export interface SyncQueueItem {
  id: string;
  contactId: string;
  operation: "create" | "update" | "delete";
  data: any;
  timestamp: string;
  retryCount: number;
}

export interface Client {
  id: string;
  clientId: string;
  summary?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  website?: string;
  billingAddress?: string;
  billingEmail?: string;
  billingPhone?: string;
  status: "active" | "inactive" | "archived";
  customFields: CustomField[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  type: "hosting" | "ssl" | "email" | "cdn" | "backup" | "monitoring" | "other";
  provider?: string;
  status: "active" | "inactive" | "expired";
  billingCycle: "monthly" | "annual" | "one-time";
  cost: number;
  renewalDate?: string;
  notes?: string;
}

export interface DNSRecord {
  id: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SOA" | "SRV";
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
}

export interface ContactInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
}

export interface Domain {
  id: string;
  name: string;
  registrar: "Hostinger" | "GoDaddy" | "Namecheap" | "other";
  registrarUrl?: string;
  purchaseDate: string;
  expirationDate: string;
  renewalPrice: number;
  renewalCurrency: string;
  autoRenew: boolean;
  status: "active" | "expired" | "pending-renewal";
  services: Service[];
  dnsRecords: DNSRecord[];
  contactInfo: ContactInfo;
  contactId?: string;
  notes?: string;
  currency?: "USD" | "EUR" | "INR";
  syncStatus?: "synced" | "pending" | "syncing" | "failed";
}

export interface DomainSyncQueueItem {
  id: string;
  domainId: string;
  operation: "create" | "update" | "delete";
  data: any;
  timestamp: string;
  retryCount: number;
}

export interface ImportCSVResult {
  contacts: Contact[];
  duplicates: number;
  errors: string[];
}
