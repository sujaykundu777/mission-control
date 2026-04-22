'use client'

import { useState, useMemo } from 'react'
import { Client } from '@/lib/types'
import { storage } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search } from 'lucide-react'

interface ClientSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (client: Client) => void
  excludeIds?: string[]
}

export function ClientSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  excludeIds = [],
}: ClientSelectorDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const allClients = storage.getClients()

  const filteredClients = useMemo(() => {
    return allClients.filter((client) => {
      if (excludeIds.includes(client.id)) return false
      if (!searchTerm) return true

      return (
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })
  }, [searchTerm, allClients, excludeIds])

  const handleSelect = (client: Client) => {
    onSelect(client)
    setSearchTerm('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Client</DialogTitle>
          <DialogDescription>Choose a client to associate with this domain</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border"
              autoFocus
            />
          </div>

          {/* Client List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredClients.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {allClients.length === 0 ? 'No clients available' : 'No matching clients'}
              </p>
            ) : (
              filteredClients.map((client) => (
                <Button
                  key={client.id}
                  variant="outline"
                  className="w-full justify-start text-left border-border h-20 hover:bg-card"
                  onClick={() => handleSelect(client)}
                >
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                    {client.company && <p className="text-xs text-muted-foreground">{client.company}</p>}
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}