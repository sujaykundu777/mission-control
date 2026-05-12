'use client'

import { useState, useMemo, useEffect } from 'react'
import { Client, Contact } from '@/lib/types'
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

interface ContactSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (contact: Contact) => void
  excludeIds?: string[]
}

export function ContactSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  excludeIds = [],
}: ContactSelectorDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [allContacts, setAllContacts] = useState<Contact[]>([])

  useEffect(() => {
    const loadClients = async () => {
      await storage.getContacts().then(setAllContacts)
    }
    loadClients()
  }, [])

  const filteredContacts = useMemo(() => {
    return allContacts.filter((contact) => {
      if (excludeIds.includes(contact.id)) return false
      if (!searchTerm) return true

      return (
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })
  }, [searchTerm, excludeIds, allContacts])

  const handleSelect = (contact: Contact) => {
    onSelect(contact)
    setSearchTerm('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Contact</DialogTitle>
          <DialogDescription>Choose a contact to associate with this domain</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border"
              autoFocus
            />
          </div>

          {/* Contact List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredContacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {allContacts.length === 0 ? 'No contacts available' : 'No matching contacts'}
              </p>
            ) : (
              filteredContacts.map((c) => (
                <Button
                  key={c.id}
                  variant="outline"
                  className="w-full justify-start text-left border-border h-20 hover:bg-card"
                  onClick={() => handleSelect(c)}
                >
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                    {c.company && <p className="text-xs text-muted-foreground">{c.company}</p>}
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