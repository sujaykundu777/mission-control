'use client'

import Link from 'next/link'
import { Domain } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'

interface DomainsListProps {
  domains: Domain[]
}

export function DomainsList({ domains }: DomainsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'pending-renewal':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getDaysUntilExpiry = (expirationDate: string) => {
    const now = new Date()
    const expiry = new Date(expirationDate)
    const diff = expiry.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-4">
      {domains.map((domain) => {
        const daysUntilExpiry = getDaysUntilExpiry(domain.expirationDate)
        const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0

        return (
          <Link href={`/domains/${domain.id}`} key={domain.id}>
            <Card className="p-6 bg-card border-border hover:bg-card/80 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{domain.name}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(domain.status)}
                      <Badge
                        variant={
                          domain.status === 'active'
                            ? 'default'
                            : domain.status === 'expired'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className={
                          domain.status === 'active'
                            ? 'bg-green-500/20 text-green-300'
                            : domain.status === 'expired'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                        }
                      >
                        {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">REGISTRAR</p>
                      <p className="text-foreground mt-1">{domain.registrar}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">EXPIRES IN</p>
                      <p className="text-foreground mt-1">
                        {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">SERVICES</p>
                      <p className="text-foreground mt-1">{domain.services.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">RENEWAL COST</p>
                      <p className="text-foreground mt-1">${domain.renewalPrice}</p>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" className="text-primary hover:text-primary/80 ml-4">
                  View Details →
                </Button>
              </div>

              {isExpiringSoon && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-yellow-400">
                    ⚠️ This domain expires soon. Auto-renewal is {domain.autoRenew ? 'enabled' : 'disabled'}.
                  </p>
                </div>
              )}
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
