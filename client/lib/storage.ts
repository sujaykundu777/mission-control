import { Domain } from './types'

const STORAGE_KEY = 'domain-manager-data'

export const storage = {
  getDomains: (): Domain[] => {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('[v0] Failed to get domains from localStorage:', error)
      return []
    }
  },

  saveDomains: (domains: Domain[]): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(domains))
    } catch (error) {
      console.error('[v0] Failed to save domains to localStorage:', error)
    }
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
