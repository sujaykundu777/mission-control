import { Domain, Contact, SyncQueueItem, DomainSyncQueueItem } from "./types";
import {
  saveToDB,
  getAllFromDB,
  getFromDB,
  deleteFromDB,
  DB_STORES,
  addToSyncQueue,
  clearSyncQueueForContact,
  getSyncQueue,
  addToDomainSyncQueue,
  clearDomainSyncQueueForDomain,
  getDomainSyncQueue,
} from "./indexeddb";
import {
  createContactApi,
  updateContactApi,
  deleteContactApi,
  fetchAllContactsApi,
} from "./api/contacts-client";
import {
  createDomainApi,
  updateDomainApi,
  deleteDomainApi,
  fetchAllDomainsApi,
} from "./api/domains-client";
import { registerBackgroundSync } from "./background-sync";
import { TEST_DOMAINS } from "@/data/test-domains";
import { TEST_CONTACT } from "@/data/test-client";

const isOnline = (): boolean => typeof navigator !== "undefined" && navigator.onLine;

// Pushes a queue entry and, where supported, registers Background Sync so
// the service worker can drain it even if this tab isn't around when
// connectivity returns. See lib/background-sync.ts for the caveats.
async function queueSync(item: Omit<SyncQueueItem, "id">): Promise<void> {
  await addToSyncQueue({ id: `sync-${Date.now()}`, ...item });
  registerBackgroundSync("sync-contacts");
}

async function queueDomainSync(item: Omit<DomainSyncQueueItem, "id">): Promise<void> {
  await addToDomainSyncQueue({ id: `domain-sync-${Date.now()}`, ...item });
  registerBackgroundSync("sync-domains");
}

// Same shape as mergeContacts (below) - last-write-wins by `updatedAt`,
// local unsynced edits win, contacts with a pending delete aren't resurrected.
function mergeDomains(local: Domain[], server: Domain[], pendingDeleteIds: Set<string>): Domain[] {
  const byId = new Map(local.map((d) => [d.id, d]));

  for (const serverDomain of server) {
    if (pendingDeleteIds.has(serverDomain.id)) continue;

    const localDomain = byId.get(serverDomain.id);
    if (!localDomain) {
      byId.set(serverDomain.id, { ...serverDomain, syncStatus: "synced" });
      continue;
    }

    // Domain has no updatedAt in the client type, so dirtiness is the only
    // signal available - the server only overwrites a fully-synced record.
    const localIsDirty =
      localDomain.syncStatus === "pending" ||
      localDomain.syncStatus === "syncing" ||
      localDomain.syncStatus === "failed";

    if (!localIsDirty) {
      byId.set(serverDomain.id, { ...serverDomain, syncStatus: "synced" });
    }
  }

  return Array.from(byId.values());
}

// Merge the server's contact list into the local one, last-write-wins by
// `updatedAt`. Local records with unsynced changes (pending/syncing/failed)
// are never overwritten by a same-or-older server record, and any contact
// still awaiting a queued delete is skipped so it isn't resurrected.
// Known limitation: there's no tombstone for deletes that already synced
// elsewhere, so a contact removed from another device won't disappear here
// until this device also deletes it.
function mergeContacts(
  local: Contact[],
  server: Contact[],
  pendingDeleteIds: Set<string>,
): Contact[] {
  const byId = new Map(local.map((c) => [c.id, c]));

  for (const serverContact of server) {
    if (pendingDeleteIds.has(serverContact.id)) continue;

    const localContact = byId.get(serverContact.id);
    if (!localContact) {
      byId.set(serverContact.id, { ...serverContact, syncStatus: "synced" });
      continue;
    }

    const localIsDirty =
      localContact.syncStatus === "pending" ||
      localContact.syncStatus === "syncing" ||
      localContact.syncStatus === "failed";
    const localIsNewer =
      new Date(localContact.updatedAt).getTime() > new Date(serverContact.updatedAt).getTime();

    if (!localIsDirty && !localIsNewer) {
      byId.set(serverContact.id, { ...serverContact, syncStatus: "synced" });
    }
    // otherwise keep the local version - it's newer or has unsynced edits
  }

  return Array.from(byId.values());
}

const INITIALIZED_KEY = "initialized";

// clients
// const CLIENTS_STORAGE_KEY = 'mission-control-os-clients'

// In-memory cache for synchronous access
// let clientsCache: Client[] | null = null;
let contactsCache: Contact[] | null = null;
let domainsCache: Domain[] | null = null;
let isCacheInitialized = false;

// Initialize cache from IndexedDB on first access
const initializeCacheFromDB = async (): Promise<void> => {
  if (isCacheInitialized) return;

  try {
    // const clients = await getAllFromDB<Client>(DB_STORES.CLIENTS)
    const contacts = await getAllFromDB<Contact>(DB_STORES.CONTACTS);
    const domains = await getAllFromDB<Domain>(DB_STORES.DOMAINS);
    const isInitialized = await getFromDB<{ key: string; value: boolean }>(
      DB_STORES.SETTINGS,
      INITIALIZED_KEY,
    );
    if (contacts.length === 0) {
      if (!isInitialized) {
        // Save test contact
        await saveToDB(DB_STORES.CONTACTS, TEST_CONTACT);
        // Mark as initialized
        await saveToDB(DB_STORES.SETTINGS, { key: INITIALIZED_KEY, value: true });
        contactsCache = [TEST_CONTACT];
      } else {
        contactsCache = [];
      }
    } else {
      contactsCache = contacts;
    }

    if (domains.length === 0) {
      // const isInitialized = await getFromDB<{ key: string; value: boolean }>(
      //   DB_STORES.SETTINGS,
      //   INITIALIZED_KEY
      // )

      if (!isInitialized) {
        // Save test domains
        for (const domain of TEST_DOMAINS) {
          await saveToDB(DB_STORES.DOMAINS, domain);
        }
        // Mark as initialized
        await saveToDB(DB_STORES.SETTINGS, { key: INITIALIZED_KEY, value: true });
        domainsCache = TEST_DOMAINS;
      } else {
        domainsCache = [];
      }
    } else {
      domainsCache = domains;
    }

    isCacheInitialized = true;
  } catch (error) {
    console.error("Failed to initialize cache from IndexedDB:", error);
    // clientsCache = []
    contactsCache = [];
    domainsCache = [];
    isCacheInitialized = true;
  }
};

export const storage = {
  getContacts: async (): Promise<Contact[]> => {
    if (typeof window === "undefined") return [];
    if (contactsCache === null) {
      await initializeCacheFromDB();
    }
    return contactsCache || [];
  },

  // Reads local contacts and, if online, reconciles them against the server
  // list (see mergeContacts above) and persists the merged result. Call this
  // from read paths that want fresh data (page load, reconnect) - it's
  // deliberately separate from getContacts() so the mutation methods above,
  // which call getContacts() internally, don't trigger a network round trip
  // on every optimistic write.
  refreshContactsFromServer: async (): Promise<Contact[]> => {
    const localContacts = await storage.getContacts();
    if (!isOnline()) return localContacts;

    try {
      const [serverContacts, queue] = await Promise.all([fetchAllContactsApi(), getSyncQueue()]);
      const pendingDeleteIds = new Set(
        queue.filter((item) => item.operation === "delete").map((item) => item.contactId),
      );

      const merged = mergeContacts(localContacts, serverContacts, pendingDeleteIds);
      storage.saveContacts(merged);
      return merged;
    } catch (error) {
      console.error("Failed to refresh contacts from server, using local cache:", error);
      return localContacts;
    }
  },

  // saveClients: (clients: Client[]) : void => {
  //   if (typeof window === 'undefined') return

  //   clientsCache = clients
  //   Promise.all(clients.map((client) => saveToDB(DB_STORES.CLIENTS, client))).catch(
  //     (error) => console.error('Failed to save client to IndexedDB:', error)
  //   )
  // },

  // addClient: async (client: Client): Promise<Client[]> => {
  //   const clients = await storage.getContacts()
  //   clients.push(client)
  //   storage.saveClients(clients);
  //   return clients;
  // },

  saveContacts: (contacts: Contact[]): void => {
    if (typeof window === "undefined") return;

    contactsCache = contacts;
    Promise.all(contacts.map((contact) => saveToDB(DB_STORES.CONTACTS, contact))).catch((error) =>
      console.error("Failed to save contact to IndexedDB:", error),
    );
  },

  addContact: async (contact: Contact): Promise<Contact[]> => {
    const online = isOnline();
    const localContact: Contact = { ...contact, syncStatus: online ? "syncing" : "pending" };

    // 1. Optimistic local write - the UI sees this immediately either way.
    const contacts = await storage.getContacts();
    contacts.push(localContact);
    storage.saveContacts(contacts);

    if (!online) {
      await queueSync({
        contactId: localContact.id,
        operation: "create",
        data: localContact,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
      return contacts;
    }

    // 2. Try the network. On failure, queue it instead of losing the write.
    // Note: the server assigns its own `id` (Prisma cuid), so the temp local
    // id used above is swapped out here. Any caller holding on to the temp id
    // (e.g. routing to /contacts/[id] right after create) should re-fetch by
    // contactId or listen for the reconciled record instead of assuming the
    // temp id remains valid - that reconciliation UX is a known follow-up.
    try {
      const serverContact = await createContactApi(localContact);
      const reconciled = (await storage.getContacts())
        .filter((c) => c.id !== localContact.id)
        .concat({ ...serverContact, syncStatus: "synced" });
      storage.saveContacts(reconciled);
      return reconciled;
    } catch (error) {
      console.error("Failed to create contact on server, queued for retry:", error);
      await queueSync({
        contactId: localContact.id,
        operation: "create",
        data: localContact,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
      const failed = (await storage.getContacts()).map((c) =>
        c.id === localContact.id ? { ...c, syncStatus: "failed" as const } : c,
      );
      storage.saveContacts(failed);
      return failed;
    }
  },

  getDomains: (): Domain[] => {
    if (typeof window === "undefined") return [];

    if (domainsCache === null) {
      // Cache not initialized yet, initialize it in the background
      initializeCacheFromDB().catch(() => {
        domainsCache = [];
      });
      return domainsCache || [];
    }
    return domainsCache;
  },

  // Async counterpart to getDomains() that reconciles with the server (see
  // mergeDomains above). getDomains()/addDomain()/etc. stay synchronous
  // on purpose - they're called from many components that destructure the
  // return value immediately - so call this from a page-load effect instead.
  refreshDomainsFromServer: async (): Promise<Domain[]> => {
    const localDomains = storage.getDomains();
    if (!isOnline()) return localDomains;

    try {
      const [serverDomains, queue] = await Promise.all([
        fetchAllDomainsApi(),
        getDomainSyncQueue(),
      ]);
      const pendingDeleteIds = new Set(
        queue.filter((item) => item.operation === "delete").map((item) => item.domainId),
      );

      const merged = mergeDomains(localDomains, serverDomains, pendingDeleteIds);
      storage.saveDomains(merged);
      return merged;
    } catch (error) {
      console.error("Failed to refresh domains from server, using local cache:", error);
      return localDomains;
    }
  },

  saveDomains: (domains: Domain[]): void => {
    if (typeof window === "undefined") return;

    domainsCache = domains;
    Promise.all(domains.map((domain) => saveToDB(DB_STORES.DOMAINS, domain))).catch((error) =>
      console.error("Failed to save domains to IndexedDB:", error),
    );
  },

  // Stays synchronous (existing callers rely on the immediate return value).
  // The network attempt and queueing happen in the background; anything
  // that needs the reconciled result (temp id swapped for the server's,
  // syncStatus updated) should re-read via getDomains() after the fact,
  // e.g. from refreshDomainsFromServer() on next page load.
  addDomain: (domain: Domain): Domain[] => {
    const online = isOnline();
    const localDomain: Domain = { ...domain, syncStatus: online ? "syncing" : "pending" };

    const domains = storage.getDomains();
    domains.push(localDomain);
    storage.saveDomains(domains);

    if (!online) {
      queueDomainSync({
        domainId: localDomain.id,
        operation: "create",
        data: localDomain,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      }).catch((error) => console.error("Failed to queue domain create:", error));
      return domains;
    }

    createDomainApi(localDomain)
      .then((serverDomain) => {
        const current = storage
          .getDomains()
          .filter((d) => d.id !== localDomain.id)
          .concat({ ...serverDomain, syncStatus: "synced" });
        storage.saveDomains(current);
      })
      .catch((error) => {
        console.error("Failed to create domain on server, queued for retry:", error);
        queueDomainSync({
          domainId: localDomain.id,
          operation: "create",
          data: localDomain,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        }).catch((queueError) => console.error("Failed to queue domain create:", queueError));
        const failed = storage
          .getDomains()
          .map((d) => (d.id === localDomain.id ? { ...d, syncStatus: "failed" as const } : d));
        storage.saveDomains(failed);
      });

    return domains;
  },

  updateDomain: (id: string, updates: Partial<Domain>): Domain[] => {
    const domains = storage.getDomains();
    const index = domains.findIndex((d) => d.id === id);
    if (index === -1) return domains;

    const online = isOnline();
    const updatedLocal: Domain = {
      ...domains[index],
      ...updates,
      syncStatus: online ? "syncing" : "pending",
    };
    domains[index] = updatedLocal;
    storage.saveDomains(domains);

    if (!online) {
      queueDomainSync({
        domainId: id,
        operation: "update",
        data: updatedLocal,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      }).catch((error) => console.error("Failed to queue domain update:", error));
      return domains;
    }

    updateDomainApi(id, updatedLocal)
      .then((serverDomain) => {
        const current = storage
          .getDomains()
          .map((d) => (d.id === id ? { ...serverDomain, syncStatus: "synced" as const } : d));
        storage.saveDomains(current);
        clearDomainSyncQueueForDomain(id).catch(() => {});
      })
      .catch((error) => {
        console.error("Failed to update domain on server, queued for retry:", error);
        queueDomainSync({
          domainId: id,
          operation: "update",
          data: updatedLocal,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        }).catch((queueError) => console.error("Failed to queue domain update:", queueError));
        const failed = storage
          .getDomains()
          .map((d) => (d.id === id ? { ...d, syncStatus: "failed" as const } : d));
        storage.saveDomains(failed);
      });

    return domains;
  },

  deleteDomain: (id: string): Domain[] => {
    const online = isOnline();
    const domains = storage.getDomains().filter((d) => d.id !== id);
    storage.saveDomains(domains);
    deleteFromDB(DB_STORES.DOMAINS, id).catch((error) =>
      console.error("Failed to delete domain from IndexedDB:", error),
    );

    if (!online) {
      queueDomainSync({
        domainId: id,
        operation: "delete",
        data: null,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      }).catch((error) => console.error("Failed to queue domain delete:", error));
    } else {
      deleteDomainApi(id)
        .then(() => clearDomainSyncQueueForDomain(id))
        .catch((error) => {
          console.error("Failed to delete domain on server, queued for retry:", error);
          queueDomainSync({
            domainId: id,
            operation: "delete",
            data: null,
            timestamp: new Date().toISOString(),
            retryCount: 0,
          }).catch((queueError) => console.error("Failed to queue domain delete:", queueError));
        });
    }
    return domains;
  },

  getDomainById: (id: string): Domain | null => {
    const domains = storage.getDomains();
    return domains.find((d) => d.id === id) || null;
  },

  // Analytics
  getStats: () => {
    const domains = storage.getDomains();
    const totalDomains = domains.length;
    const activeDomains = domains.filter((d) => d.status === "active").length;
    const expiredDomains = domains.filter((d) => d.status === "expired").length;
    const totalServices = domains.reduce((acc, d) => acc + d.services.length, 0);
    const totalCosts = domains.reduce(
      (acc, d) => acc + d.services.reduce((s, srv) => s + srv.cost, 0),
      0,
    );

    return {
      totalDomains,
      activeDomains,
      expiredDomains,
      totalServices,
      totalCosts,
    };
  },

  // get all clients
  // getClients: (): Client[] => {
  //   if (typeof window === 'undefined') return []
  //   try {
  //     const data = localStorage.getItem(CLIENTS_STORAGE_KEY)
  //     return data ? JSON.parse(data) : []
  //   } catch (error) {
  //     console.error('Failed to get clients from localstorage', error)
  //     return []
  //   }
  // },

  // get client by id
  // getClientById: async (id: string): Promise<Client | null> => {
  //   const clients = await storage.getContacts()
  //   console.log('id', id);
  //   console.log('clients', clients);
  //   return clients.find((c) => c.id === id) || null
  // },

  getContactById: async (id: string): Promise<Contact | null> => {
    const contacts = await storage.getContacts();
    return contacts.find((c) => c.id === id) || null;
  },

  // update existing client
  // updateClient: async (id: string, updates: Partial<Client>): Promise<Client[]> => {
  //   const clients = await storage.getContacts()
  //   console.log('clients >> update')
  //   const index = clients.findIndex((c) => c.id === id)
  //   if (index !== -1) {
  //     clients[index] = {
  //       ...clients[index],
  //       ...updates,
  //       updatedAt: new Date().toISOString(),
  //     }
  //     storage.saveClients(clients);
  //   }
  //   return clients;
  // },

  updateContact: async (id: string, updates: Partial<Contact>): Promise<Contact[]> => {
    const contacts = await storage.getContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) return contacts;

    const online = isOnline();
    const updatedLocal: Contact = {
      ...contacts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: online ? "syncing" : "pending",
    };
    contacts[index] = updatedLocal;
    storage.saveContacts(contacts);

    if (!online) {
      await queueSync({
        contactId: id,
        operation: "update",
        data: updatedLocal,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
      return contacts;
    }

    try {
      const serverContact = await updateContactApi(id, updatedLocal);
      const synced = contacts.map((c) =>
        c.id === id ? { ...serverContact, syncStatus: "synced" as const } : c,
      );
      storage.saveContacts(synced);
      await clearSyncQueueForContact(id);
      return synced;
    } catch (error) {
      console.error("Failed to update contact on server, queued for retry:", error);
      await queueSync({
        contactId: id,
        operation: "update",
        data: updatedLocal,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
      const failed = contacts.map((c) =>
        c.id === id ? { ...c, syncStatus: "failed" as const } : c,
      );
      storage.saveContacts(failed);
      return failed;
    }
  },

  // deleteClient: async (id: string): Promise<Client[]> => {
  //   const clients = (await storage.getContacts()).filter((c) => c.id !== id)
  //   clientsCache = clients
  //   storage.saveClients(clients)
  //   deleteFromDB(DB_STORES.CLIENTS, id).catch((error) =>
  //     console.error('Failed to delete client from IndexedDB:', error)
  //   )

  //   // clean up domain associations
  //   const domains = storage.getDomains()
  //   const updatedDomains = domains.map((d) => d.clientId === id ? { ...d, clientId: undefined } : d);
  //   storage.saveDomains(updatedDomains);
  //   return clients;
  // },

  deleteContact: async (id: string): Promise<Contact[]> => {
    const online = isOnline();
    const contacts = (await storage.getContacts()).filter((c) => c.id !== id);
    contactsCache = contacts;
    storage.saveContacts(contacts);
    deleteFromDB(DB_STORES.CONTACTS, id).catch((error) =>
      console.error("Failed to delete contact from IndexedDB:", error),
    );

    // clean up domain associations
    const domains = storage.getDomains();
    const updatedDomains = domains.map((d) =>
      d.contactId === id ? { ...d, contactId: undefined } : d,
    ); // need to use contact id
    storage.saveDomains(updatedDomains);

    if (!online) {
      await queueSync({
        contactId: id,
        operation: "delete",
        data: null,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
      return contacts;
    }

    try {
      await deleteContactApi(id);
      await clearSyncQueueForContact(id);
    } catch (error) {
      console.error("Failed to delete contact on server, queued for retry:", error);
      await queueSync({
        contactId: id,
        operation: "delete",
        data: null,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
    }

    return contacts;
  },

  // get client domains
  // getClientDomains: (clientId: string): Domain[] => {
  //   const domains = storage.getDomains()
  //   return domains.filter((d) => d.clientId === clientId);
  // },

  getContactDomains: (contactId: string): Domain[] => {
    const domains = storage.getDomains();
    return domains.filter((d) => d.contactId === contactId);
  },

  // Associate domain to client
  associateDomainToContact: (domainId: string, contactId: string): Domain[] => {
    const domains = storage.getDomains();
    const index = domains.findIndex((d) => d.id === domainId);
    if (index !== -1) {
      domains[index] = { ...domains[index], contactId };
      storage.saveDomains(domains);
    }
    return domains;
  },

  // Disassociate domain to client
  disassociateDomainFromClient: (domainId: string): Domain[] => {
    const domains = storage.getDomains();
    const index = domains.findIndex((d) => d.id === domainId);
    if (index !== -1) {
      domains[index] = { ...domains[index], contactId: undefined };
      storage.saveDomains(domains);
    }
    return domains;
  },

  // contact stats
  getContactsStats: async () => {
    const contacts = await storage.getContacts();
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter((c) => c.status === "active").length;
    const inactiveContacts = contacts.filter((c) => c.status === "inactive").length;
    const archivedContacts = contacts.filter((c) => c.status === "archived").length;

    return {
      totalContacts,
      activeContacts,
      inactiveContacts,
      archivedContacts,
    };
  },
};
