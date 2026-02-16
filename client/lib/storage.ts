import { Domain } from './types'
import { saveToDB, getAllFromDB, getFromDB, deleteFromDB, DB_STORES } from './indexeddb'
import { TEST_DOMAINS } from '@/data/test-domains'

const INITIALIZED_KEY = 'initialized'

// In-memory cache for synchronous access
let domainsCache: Domain[] | null = null
let isCacheInitialized = false


// Initialize cache from IndexedDB on first access
const initializeCacheFromDB = async (): Promise<void> => {
  if (isCacheInitialized) return

  try {
    const domains = await getAllFromDB<Domain>(DB_STORES.DOMAINS)
    
    if (domains.length === 0) {
      const isInitialized = await getFromDB<{ key: string; value: boolean }>(
        DB_STORES.SETTINGS,
        INITIALIZED_KEY
      )
      
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
    domainsCache = []
    isCacheInitialized = true
  }
}

export const storage = {
  getDomains: (): Domain[] => {
    if (typeof window === 'undefined') return []

    if (domainsCache === null) {
      // Cache not initialized yet, initialize it in the background
      initializeCacheFromDB().catch(() => {
        domainsCache = [];
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
}
