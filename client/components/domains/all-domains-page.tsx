'use client'

import { useEffect, useState } from 'react'
import { search, Settings2 } from 'lucide-react'
import { Domain } from '@/lib/types'
import { storage } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { DomainsList } from '@/components/dashboard/domains-list'

export function AllDomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const allDomains = storage.getDomains()
    setDomains(allDomains)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let filtered = domains

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.registrar.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter((d) => d.status === 'pending-renewal')
      } else {
        filtered = filtered.filter((d) => d.status === statusFilter)
      }
    }

    setFilteredDomains(filtered)
  }, [domains, searchTerm, statusFilter])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Domains</h1>
          <p className="text-muted-foreground mt-2">{domains.length} total domains</p>
        </div>
        <Link href="/domains/add">
          <Button className="bg-primary hover:bg-primary/90">Add Domain</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search domains or registrars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'active', 'expired', 'pending'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                className={
                  statusFilter === status
                    ? 'bg-primary hover:bg-primary/90'
                    : 'border-border hover:bg-card'
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredDomains.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Settings2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No domains found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first domain'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link href="/domains/add">
              <Button>Add Your First Domain</Button>
            </Link>
          )}
        </div>
      ) : (
        <DomainsList domains={filteredDomains} />
      )}
    </div>
  )
}
