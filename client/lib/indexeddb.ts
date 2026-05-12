const DB_NAME = 'mission-control-db'
const DB_VERSION = 1
const STORES = {
    CLIENTS: 'clients',
    CONTACTS: 'contacts',
    DOMAINS: 'domains',
    SETTINGS: 'settings'
}

let dbInstance: IDBDatabase | null = null

export const initDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {

        // if existing db instance then use that
        if (dbInstance) {
            resolve(dbInstance)
            return;
        }

        // open a connection to index db
        // indexdb (db_name, db_version)
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            dbInstance = request.result
            resolve(dbInstance)
        }

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result

            // Create clients store
            // if (!db.objectStoreNames.contains(STORES.CLIENTS)) {
            //   db.createObjectStore(STORES.CLIENTS, { keyPath: 'id'})
            // }

            // Create Contacts Store
             if (!db.objectStoreNames.contains(STORES.CONTACTS)) {
              db.createObjectStore(STORES.CONTACTS, { keyPath: 'id'})
            }


            // Create domains store 
            if (!db.objectStoreNames.contains(STORES.DOMAINS)) {
                db.createObjectStore(STORES.DOMAINS, { keyPath: 'id' });
            }

            // Create settings store
            if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                db.createObjectStore(STORES.SETTINGS, { keyPath: 'key'})
            }
        }

    })
}


export const getFromDB = async<T>(storeName: string, key: string): Promise<T | undefined> => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName)
        const request = store.get(key);

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result);
    })
}

export const getAllFromDB = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export const saveToDB = async <T extends { id?: string; key?: string }>(
  storeName: string,
  data: T
): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(data)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export const deleteFromDB = async (storeName: string, key: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(key)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export const clearStore = async (storeName: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export const DB_STORES = STORES