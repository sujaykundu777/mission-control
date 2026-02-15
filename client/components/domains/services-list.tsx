'use client'

import Link from 'next/link'
import { Service } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2 } from 'lucide-react'
import { storage } from '@/lib/storage'
import { useRouter } from 'next/navigation'

interface ServicesListProps {
  services: Service[]
  domainId: string
}

const SERVICE_ICONS: Record<string, string> = {
  hosting: '🏢',
  ssl: '🔒',
  email: '📧',
  cdn: '⚡',
  backup: '💾',
  monitoring: '📊',
  other: '📌',
}

export function ServicesList({ services, domainId }: ServicesListProps) {
  const router = useRouter()

  const handleDelete = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      const domain = storage.getDomainById(domainId)
      if (domain) {
        const updatedServices = domain.services.filter((s) => s.id !== serviceId)
        storage.updateDomain(domainId, { services: updatedServices })
        router.refresh()
      }
    }
  }

  if (services.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-muted-foreground mb-4">No services added yet</p>
        <Link href={`/domains/${domainId}/services/add`}>
          <Button className="bg-primary hover:bg-primary/90">Add First Service</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card key={service.id} className="p-6 bg-card border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{SERVICE_ICONS[service.type]}</span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
                    {service.provider && ` • ${service.provider}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">STATUS</p>
                  <div className="mt-1">
                    <Badge
                      variant={service.status === 'active' ? 'default' : 'secondary'}
                      className={
                        service.status === 'active'
                          ? 'bg-green-500/20 text-green-300'
                          : service.status === 'expired'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-gray-500/20 text-gray-300'
                      }
                    >
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">BILLING</p>
                  <p className="text-foreground mt-1 text-sm">
                    {service.billingCycle.charAt(0).toUpperCase() + service.billingCycle.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">COST</p>
                  <p className="text-foreground mt-1 text-sm font-semibold">${service.cost}</p>
                </div>
                {service.renewalDate && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">RENEWAL</p>
                    <p className="text-foreground mt-1 text-sm">
                      {new Date(service.renewalDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {service.notes && (
                <div className="mt-3 p-3 bg-secondary rounded text-sm text-muted-foreground">
                  {service.notes}
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              <Link href={`/domains/${domainId}/services/${service.id}/edit`}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(service.id)}
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
