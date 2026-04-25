"use client";

import { useEffect, useState } from "react";
import { Search, Plus, ImportIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input'
import { Client } from "@/lib/types";
import { storage } from "@/lib/storage";
import { ClientsTable } from "./clients-table";
import { ImportClientModal } from "./import-client-modal";
import { ExportClientsDialog } from './export-clients-dialog'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function AllClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
  const [showImportClientModal, setShowImportClientModal] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false)

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const allClients = storage.getClients();
    setClients(allClients);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let filtered = clients;

    // search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }


    setFilteredClients(filtered);

  }, [clients, searchTerm, statusFilter]);



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const stats = storage.getClientStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-2">
            {" "}
            {stats.totalClients} total • {stats.activeClients} active
          </p>
        </div>
        <div className="flex">
           <Button
            variant="outline"
            className="border-border mx-2 hover:bg-card"
            onClick={() => setShowExportDialog(true)}
            disabled={clients.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        <Link href="/clients/add">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </Link>
        
          <Button onClick={() => setShowImportClientModal(true)} className="bg-gray-800 border-1 mx-2 border-gray-200 hover:bg-gray/90">
              <ImportIcon  className="w-4 h-4 mr-2" />
              Import via CSV
          </Button>
        
        </div>
      </div>
      {/* Filters */}
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search clients by name, email or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border"
              />
          </div>

            <div className="flex gap-2">
            {(['all', 'active', 'inactive', 'archived'] as const).map((status) => (
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
      {
        filteredClients.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
             <h3 className="text-lg font-semibold text-foreground mb-2">No clients found</h3>
              <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first client'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
            <Link href="/clients/add">
              <Button>Add Your First Client</Button>
            </Link>
          )}
          </div>
        ) : (
           <ClientsTable
              clients={filteredClients}
              onClientsChange={() => setClients(storage.getClients())}
            />
        )
      }

      {/* Export Dialog */}
      <ExportClientsDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        clients={filteredClients}
      />

      {/* Import client dialog */}
      <ImportClientModal
          open={showImportClientModal}
          onOpenChange={setShowImportClientModal}
          onImportComplete={(clients) => {
            setShowImportClientModal(false)
            if (clients.length > 0) {
             setClients(clients)
            }
        }}
        />
    </div>
  );
}
