'use client'

import Link from 'next/link'
import { DNSRecord } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, Copy } from 'lucide-react'
import { storage } from '@/lib/storage'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DNSRecordsListProps {
  records: DNSRecord[]
  domainId: string
}

export function DNSRecordsList({ records, domainId }: DNSRecordsListProps) {
  const router = useRouter()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleDelete = (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this DNS record?')) {
      const domain = storage.getDomainById(domainId)
      if (domain) {
        const updatedRecords = domain.dnsRecords.filter((r) => r.id !== recordId)
        storage.updateDomain(domainId, { dnsRecords: updatedRecords })
        router.refresh()
      }
    }
  }

  const handleCopy = (value: string, recordId: string) => {
    navigator.clipboard.writeText(value)
    setCopiedId(recordId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (records.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-muted-foreground mb-4">No DNS records added yet</p>
        <Link href={`/domains/${domainId}/dns/add`}>
          <Button className="bg-primary hover:bg-primary/90">Add First DNS Record</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="hidden md:grid md:grid-cols-5 gap-4 p-4 bg-secondary rounded-lg mb-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">TYPE</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">NAME</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs font-semibold text-muted-foreground">VALUE</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">ACTIONS</p>
        </div>
      </div>

      {records.map((record) => (
        <Card key={record.id} className="p-4 bg-card border-border">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div>
              <p className="text-xs font-semibold text-muted-foreground md:hidden">TYPE</p>
              <p className="font-mono font-semibold text-primary">{record.type}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground md:hidden">NAME</p>
              <p className="font-mono text-sm text-foreground break-all">{record.name || '@'}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-muted-foreground md:hidden">VALUE</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-foreground break-all">{record.value}</p>
                {record.ttl && (
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    TTL: {record.ttl}
                  </span>
                )}
                {record.priority && (
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    Priority: {record.priority}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(record.value, record.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Link href={`/domains/${domainId}/dns/${record.id}/edit`}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(record.id)}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
