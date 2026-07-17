import {
  getSyncQueue,
  removeSyncQueueItem,
  updateSyncQueueItem,
  clearSyncQueueForContact,
  getDomainSyncQueue,
  removeDomainSyncQueueItem,
  updateDomainSyncQueueItem,
  clearDomainSyncQueueForDomain,
} from "./indexeddb";
import { createContactApi, updateContactApi, deleteContactApi } from "./api/contacts-client";
import { createDomainApi, updateDomainApi, deleteDomainApi } from "./api/domains-client";
import { storage } from "./storage";
import type { SyncQueueItem, DomainSyncQueueItem, Contact, Domain } from "./types";

const MAX_RETRIES = 3;

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
}

/**
 * Drains the syncQueue in the order operations were made, replaying each one
 * against the real API. Successes are removed from the queue immediately.
 * Failures get a retry (up to MAX_RETRIES) before being dropped and the
 * affected contact marked `failed` so the UI can surface it.
 */
export async function syncPendingOperations(): Promise<SyncResult> {
  if (typeof navigator === "undefined" || !navigator.onLine) {
    return { success: false, synced: 0, failed: 0 };
  }

  const queue = await getSyncQueue();
  if (queue.length === 0) {
    return { success: true, synced: 0, failed: 0 };
  }

  const sortedQueue = [...queue].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  let synced = 0;
  let failed = 0;

  for (const item of sortedQueue) {
    try {
      await processSyncItem(item);
      await removeSyncQueueItem(item.id);
      synced++;
    } catch (error) {
      failed++;
      console.error(`Sync failed for ${item.operation} on contact ${item.contactId}:`, error);

      if (item.retryCount < MAX_RETRIES) {
        await updateSyncQueueItem({ ...item, retryCount: item.retryCount + 1 });
      } else {
        await removeSyncQueueItem(item.id);
        await markContactFailed(item.contactId);
      }
    }
  }

  return { success: failed === 0, synced, failed };
}

async function processSyncItem(item: SyncQueueItem): Promise<void> {
  switch (item.operation) {
    case "create": {
      const serverContact = await createContactApi(item.data as Contact);
      const contacts = (await storage.getContacts())
        .filter((c) => c.id !== item.contactId)
        .concat({ ...serverContact, syncStatus: "synced" });
      storage.saveContacts(contacts);
      // The temp id is gone now - drop any other queued ops still referencing it.
      await clearSyncQueueForContact(item.contactId);
      break;
    }

    case "update": {
      const serverContact = await updateContactApi(item.contactId, item.data as Partial<Contact>);
      const contacts = (await storage.getContacts()).map((c) =>
        c.id === item.contactId ? { ...serverContact, syncStatus: "synced" as const } : c,
      );
      storage.saveContacts(contacts);
      break;
    }

    case "delete": {
      await deleteContactApi(item.contactId);
      break;
    }

    default:
      throw new Error(`Unknown sync operation: ${(item as SyncQueueItem).operation}`);
  }
}

async function markContactFailed(contactId: string): Promise<void> {
  const contacts = await storage.getContacts();
  if (!contacts.some((c) => c.id === contactId)) return; // already gone locally

  const updated = contacts.map((c) =>
    c.id === contactId ? { ...c, syncStatus: "failed" as const } : c,
  );
  storage.saveContacts(updated);
}

/** Domain counterpart to syncPendingOperations - identical shape, separate queue. */
export async function syncPendingDomainOperations(): Promise<SyncResult> {
  if (typeof navigator === "undefined" || !navigator.onLine) {
    return { success: false, synced: 0, failed: 0 };
  }

  const queue = await getDomainSyncQueue();
  if (queue.length === 0) {
    return { success: true, synced: 0, failed: 0 };
  }

  const sortedQueue = [...queue].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  let synced = 0;
  let failed = 0;

  for (const item of sortedQueue) {
    try {
      await processSyncDomainItem(item);
      await removeDomainSyncQueueItem(item.id);
      synced++;
    } catch (error) {
      failed++;
      console.error(`Sync failed for ${item.operation} on domain ${item.domainId}:`, error);

      if (item.retryCount < MAX_RETRIES) {
        await updateDomainSyncQueueItem({ ...item, retryCount: item.retryCount + 1 });
      } else {
        await removeDomainSyncQueueItem(item.id);
        await markDomainFailed(item.domainId);
      }
    }
  }

  return { success: failed === 0, synced, failed };
}

async function processSyncDomainItem(item: DomainSyncQueueItem): Promise<void> {
  switch (item.operation) {
    case "create": {
      const serverDomain = await createDomainApi(item.data as Domain);
      const domains = storage
        .getDomains()
        .filter((d) => d.id !== item.domainId)
        .concat({ ...serverDomain, syncStatus: "synced" });
      storage.saveDomains(domains);
      await clearDomainSyncQueueForDomain(item.domainId);
      break;
    }

    case "update": {
      const serverDomain = await updateDomainApi(item.domainId, item.data as Partial<Domain>);
      const domains = storage
        .getDomains()
        .map((d) =>
          d.id === item.domainId ? { ...serverDomain, syncStatus: "synced" as const } : d,
        );
      storage.saveDomains(domains);
      break;
    }

    case "delete": {
      await deleteDomainApi(item.domainId);
      break;
    }

    default:
      throw new Error(`Unknown sync operation: ${(item as DomainSyncQueueItem).operation}`);
  }
}

async function markDomainFailed(domainId: string): Promise<void> {
  const domains = storage.getDomains();
  if (!domains.some((d) => d.id === domainId)) return;

  const updated = domains.map((d) =>
    d.id === domainId ? { ...d, syncStatus: "failed" as const } : d,
  );
  storage.saveDomains(updated);
}

/** Drains both queues and combines the counts - what the UI actually calls. */
export async function syncAllPending(): Promise<SyncResult> {
  const [contactsResult, domainsResult] = await Promise.all([
    syncPendingOperations(),
    syncPendingDomainOperations(),
  ]);

  return {
    success: contactsResult.success && domainsResult.success,
    synced: contactsResult.synced + domainsResult.synced,
    failed: contactsResult.failed + domainsResult.failed,
  };
}
