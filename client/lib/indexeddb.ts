import type { SyncQueueItem, DomainSyncQueueItem } from "./types";

const DB_NAME = "mission-control-db";
const DB_VERSION = 3;
const STORES = {
  CLIENTS: "clients",
  CONTACTS: "contacts",
  DOMAINS: "domains",
  SETTINGS: "settings",
  SYNC_QUEUE: "syncQueue",
  DOMAIN_SYNC_QUEUE: "domainSyncQueue",
};

let dbInstance: IDBDatabase | null = null;

export const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // if existing db instance then use that
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    // open a connection to index db
    // indexdb (db_name, db_version)
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create clients store
      // if (!db.objectStoreNames.contains(STORES.CLIENTS)) {
      //   db.createObjectStore(STORES.CLIENTS, { keyPath: 'id'})
      // }

      // Create Contacts Store
      if (!db.objectStoreNames.contains(STORES.CONTACTS)) {
        db.createObjectStore(STORES.CONTACTS, { keyPath: "id" });
      }

      // Create domains store
      if (!db.objectStoreNames.contains(STORES.DOMAINS)) {
        db.createObjectStore(STORES.DOMAINS, { keyPath: "id" });
      }

      // Create settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: "key" });
      }

      // Create sync queue store - holds pending create/update/delete ops
      // that couldn't reach the server yet (offline, or a failed request)
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: "id" });
      }

      // Same idea as SYNC_QUEUE, but for domains - kept as a separate store
      // rather than a shared/discriminated one so the (already working)
      // contacts queue logic didn't need to change shape.
      if (!db.objectStoreNames.contains(STORES.DOMAIN_SYNC_QUEUE)) {
        db.createObjectStore(STORES.DOMAIN_SYNC_QUEUE, { keyPath: "id" });
      }
    };
  });
};

export const getFromDB = async <T>(storeName: string, key: string): Promise<T | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getAllFromDB = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const saveToDB = async <T extends { id?: string; key?: string }>(
  storeName: string,
  data: T,
): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const deleteFromDB = async (storeName: string, key: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const clearStore = async (storeName: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const DB_STORES = STORES;

// --- Sync queue helpers -----------------------------------------------
// Thin wrappers around the generic helpers above, scoped to the
// syncQueue store, so storage.ts doesn't need to know the store name.

export const addToSyncQueue = (item: SyncQueueItem): Promise<void> =>
  saveToDB(STORES.SYNC_QUEUE, item);

export const updateSyncQueueItem = (item: SyncQueueItem): Promise<void> =>
  saveToDB(STORES.SYNC_QUEUE, item);

export const getSyncQueue = (): Promise<SyncQueueItem[]> =>
  getAllFromDB<SyncQueueItem>(STORES.SYNC_QUEUE);

export const getSyncQueueByContactId = async (contactId: string): Promise<SyncQueueItem[]> => {
  const queue = await getSyncQueue();
  return queue.filter((item) => item.contactId === contactId);
};

export const removeSyncQueueItem = (id: string): Promise<void> =>
  deleteFromDB(STORES.SYNC_QUEUE, id);

export const clearSyncQueueForContact = async (contactId: string): Promise<void> => {
  const items = await getSyncQueueByContactId(contactId);
  await Promise.all(items.map((item) => deleteFromDB(STORES.SYNC_QUEUE, item.id)));
};

// --- Domain sync queue helpers ------------------------------------------
// Mirrors the contact sync queue helpers above, one-for-one.

export const addToDomainSyncQueue = (item: DomainSyncQueueItem): Promise<void> =>
  saveToDB(STORES.DOMAIN_SYNC_QUEUE, item);

export const updateDomainSyncQueueItem = (item: DomainSyncQueueItem): Promise<void> =>
  saveToDB(STORES.DOMAIN_SYNC_QUEUE, item);

export const getDomainSyncQueue = (): Promise<DomainSyncQueueItem[]> =>
  getAllFromDB<DomainSyncQueueItem>(STORES.DOMAIN_SYNC_QUEUE);

export const getDomainSyncQueueByDomainId = async (
  domainId: string,
): Promise<DomainSyncQueueItem[]> => {
  const queue = await getDomainSyncQueue();
  return queue.filter((item) => item.domainId === domainId);
};

export const removeDomainSyncQueueItem = (id: string): Promise<void> =>
  deleteFromDB(STORES.DOMAIN_SYNC_QUEUE, id);

export const clearDomainSyncQueueForDomain = async (domainId: string): Promise<void> => {
  const items = await getDomainSyncQueueByDomainId(domainId);
  await Promise.all(items.map((item) => deleteFromDB(STORES.DOMAIN_SYNC_QUEUE, item.id)));
};
