import { Domain, Client } from './types'
import { saveToDB, getAllFromDB, getFromDB, deleteFromDB, DB_STORES } from './indexeddb'
import { TEST_DOMAINS } from '@/data/test-domains'
import { TEST_CLIENT } from '@/data/test-client'

const INITIALIZED_KEY = 'initialized'

// clients 
// const CLIENTS_STORAGE_KEY = 'mission-control-os-clients'

// In-memory cache for synchronous access
let clientsCache: Client[] | null = null;
let domainsCache: Domain[] | null = null
let isCacheInitialized = false


// Initialize cache from IndexedDB on first access
const initializeCacheFromDB = async (): Promise<void> => {
  if (isCacheInitialized) return

  try {

    const clients = await getAllFromDB<Client>(DB_STORES.CLIENTS)
    const domains = await getAllFromDB<Domain>(DB_STORES.DOMAINS)
    const isInitialized = await getFromDB<{ key: string; value: boolean }>(
        DB_STORES.SETTINGS,
        INITIALIZED_KEY
    )
    if (clients.length === 0) {
      if (!isInitialized) {
      
        // Save test client
        await saveToDB(DB_STORES.CLIENTS, TEST_CLIENT)
        // Mark as initialized
        await saveToDB(DB_STORES.SETTINGS, { key: INITIALIZED_KEY, value: true })
        clientsCache = [TEST_CLIENT]
      } else {
        clientsCache = []
      }
      
    } else {
      clientsCache = clients;
    }
    
    if (domains.length === 0) {
      // const isInitialized = await getFromDB<{ key: string; value: boolean }>(
      //   DB_STORES.SETTINGS,
      //   INITIALIZED_KEY
      // )
      
      if (!isInitialized) {
        // Save test domains
        for (const domain of TEST_DOMAINS) {
          await saveToDB(DB_STORES.DOMAINS, domain)
        }
        // Mark as initialized
        await saveToDB(DB_STORES.SETTINGS, { key: INITIALIZED_KEY, value: true })
        domainsCache = TEST_DOMAINS
      } else {
        domainsCache = []
      }
    } else {
      domainsCache = domains
    }
    
    isCacheInitialized = true
  } catch (error) {
    console.error('Failed to initialize cache from IndexedDB:', error)
    clientsCache = []
    domainsCache = []
    isCacheInitialized = true
  }
}

export const storage = {

  getClients: async (): Promise<Client[]> => {
    // console.log('window', window);
    if (typeof window === 'undefined') return []
    console.log('clientsCache', clientsCache);
    if (clientsCache === null) {
      await initializeCacheFromDB()
    }
    return clientsCache || []
  },

  saveClients: (clients: Client[]) : void => {
    if (typeof window === 'undefined') return

    clientsCache = clients
    Promise.all(clients.map((client) => saveToDB(DB_STORES.CLIENTS, client))).catch(
      (error) => console.error('Failed to save client to IndexedDB:', error)
    )
  },

  addClient: async (client: Client): Promise<Client[]> => {
    const clients = await storage.getClients()
    clients.push(client)
    storage.saveClients(clients);
    return clients;
  },
 
  getDomains: (): Domain[] => {
    if (typeof window === 'undefined') return []

    if (domainsCache === null) {
      // Cache not initialized yet, initialize it in the background
      initializeCacheFromDB().catch(() => {
        domainsCache = []
      })
      return domainsCache || []
    }
    return domainsCache
  },

  saveDomains: (domains: Domain[]): void => {
    if (typeof window === 'undefined') return

    domainsCache = domains
    Promise.all(domains.map((domain) => saveToDB(DB_STORES.DOMAINS, domain))).catch(
      (error) => console.error('Failed to save domains to IndexedDB:', error)
    )
  },

  addDomain: (domain: Domain): Domain[] => {
    const domains = storage.getDomains()
    domains.push(domain)
    storage.saveDomains(domains)
    return domains
  },

  updateDomain: (id: string, updates: Partial<Domain>): Domain[] => {
    const domains = storage.getDomains()
    const index = domains.findIndex((d) => d.id === id)
    if (index !== -1) {
      domains[index] = { ...domains[index], ...updates }
      storage.saveDomains(domains)
    }
    return domains
  },

  deleteDomain: (id: string): Domain[] => {
    const domains = storage.getDomains().filter((d) => d.id !== id)
    storage.saveDomains(domains)
    deleteFromDB(DB_STORES.DOMAINS, id).catch((error) =>
      console.error('Failed to delete domain from IndexedDB:', error)
    )
    return domains
  },

  getDomainById: (id: string): Domain | null => {
    const domains = storage.getDomains()
    return domains.find((d) => d.id === id) || null
  },

  // Analytics
  getStats: () => {
    const domains = storage.getDomains()
    const totalDomains = domains.length
    const activeDomains = domains.filter((d) => d.status === 'active').length
    const expiredDomains = domains.filter((d) => d.status === 'expired').length
    const totalServices = domains.reduce((acc, d) => acc + d.services.length, 0)
    const totalCosts = domains.reduce(
      (acc, d) => acc + d.services.reduce((s, srv) => s + srv.cost, 0),
      0
    )

    return {
      totalDomains,
      activeDomains,
      expiredDomains,
      totalServices,
      totalCosts,
    }
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
  getClientById: async (id: string): Promise<Client | null> => {
    const clients = await storage.getClients()
    console.log('id', id);
    console.log('clients', clients);
    return clients.find((c) => c.id === id) || null
  },

  // update existing client 
  updateClient: async (id: string, updates: Partial<Client>): Promise<Client[]> => {
    const clients = await storage.getClients()
    console.log('clients >> update')
    const index = clients.findIndex((c) => c.id === id)
    if (index !== -1) {
      clients[index] = {
        ...clients[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      storage.saveClients(clients);
    }
    return clients;
  },

  deleteClient: async (id: string): Promise<Client[]> => {
    const clients = (await storage.getClients()).filter((c) => c.id !== id)
    clientsCache = clients
    storage.saveClients(clients)
    deleteFromDB(DB_STORES.CLIENTS, id).catch((error) =>
      console.error('Failed to delete client from IndexedDB:', error)
    )

    // clean up domain associations
    const domains = storage.getDomains()
    const updatedDomains = domains.map((d) => d.clientId === id ? { ...d, clientId: undefined } : d);
    storage.saveDomains(updatedDomains);
    return clients;
  },

  // get client domains
  getClientDomains: (clientId: string): Domain[] => {
    const domains = storage.getDomains()
    return domains.filter((d) => d.clientId === clientId);
  },

  // Associate domain to client
  associateDomainToClient: (domainId: string, clientId: string): Domain[] => {
    const domains = storage.getDomains()
    const index = domains.findIndex((d) => d.id === domainId)
    if (index !== -1) {
      domains[index] = { ...domains[index], clientId }
      storage.saveDomains(domains)
    }
    return domains
  },

  // Disassociate domain to client
  disassociateDomainFromClient: (domainId: string): Domain[] => {
    const domains = storage.getDomains()
    const index = domains.findIndex((d) => d.id === domainId)
    if (index !== -1) {
      domains[index] = { ...domains[index], clientId: undefined }
      storage.saveDomains(domains)
    }
    return domains
  },

  // client stats
  getClientStats: async () => {
    const clients = await storage.getClients()
    const totalClients = clients.length
    const activeClients = clients.filter((c) => c.status === 'active').length
    const inactiveClients = clients.filter((c) => c.status === 'inactive').length
    const archivedClients = clients.filter((c) => c.status === 'archived').length

    return {
      totalClients,
      activeClients,
      inactiveClients,
      archivedClients,
    }
  },

}


