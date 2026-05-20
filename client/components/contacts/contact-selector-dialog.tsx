"use client";

import { useState, useMemo, useEffect } from "react";
import { Client, Contact } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";

interface ContactSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (contact: Contact) => void;
  excludeIds?: string[];
}

export function ContactSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  excludeIds = [],
}: ContactSelectorDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allContacts, setAllContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const loadClients = async () => {
      await storage.getContacts().then(setAllContacts);
    };
    loadClients();
  }, []);

  const filteredContacts = useMemo(() => {
    return allContacts.filter((contact) => {
      if (excludeIds.includes(contact.id)) return false;
      if (!searchTerm) return true;

      return (
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [searchTerm, excludeIds, allContacts]);

  const handleSelect = (contact: Contact) => {
    onSelect(contact);
    setSearchTerm("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle>Select a Contact</DialogTitle>
          <DialogDescription>Choose a contact to associate with this domain</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-border bg-background pl-10"
              autoFocus
            />
          </div>

          {/* Contact List */}
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                {allContacts.length === 0 ? "No contacts available" : "No matching contacts"}
              </p>
            ) : (
              filteredContacts.map((c) => (
                <Button
                  key={c.id}
                  variant="outline"
                  className="h-20 w-full justify-start border-border text-left hover:bg-card"
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
  );
}
