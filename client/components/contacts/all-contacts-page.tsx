"use client";

import { useEffect, useState } from "react";
import { Search, Plus, ImportIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input'
import { Client, Contact } from "@/lib/types";
import { storage } from "@/lib/storage";
import { ContactsTable } from "./contacts-table";
import { ImportContactModal } from "./import-client-modal";
import { ExportContactsDialog } from './export-contacts-dialog'
import Link from "next/link";
// import { toast } from "sonner"
// import { useRouter } from "next/navigation";

export function AllContactsPage() {

  // const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
  const [showImportContactModal, setShowImportContactModal] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [contactsView, setContactsView] = useState<'grid' | 'list'>('list')
  const [stats, setStats] = useState({ totalContacts: 0, activeContacts: 0 });

  // const router = useRouter();

  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true);
      const allContacts = await storage.getContacts();
      setContacts(allContacts);
      const contactStats = await storage.getContactsStats();
      setStats(contactStats);
      setIsLoading(false);
    };
    loadContacts();
  }, []);

  useEffect(() => {
    let filtered = contacts;

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
    setFilteredContacts(filtered);

  }, [contacts, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-2">
            {" "}
            {stats.totalContacts} total • {stats.activeContacts} active
          </p>
        </div>
        <div className="flex">
           <Button
            variant="outline"
            className="border-border mx-2 hover:bg-card"
            onClick={() => setShowExportDialog(true)}
            disabled={contacts.length === 0}
          >
          <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        <Link href="/contacts/add">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </Link>
        
          <Button onClick={() => setShowImportContactModal(true)} className="bg-gray-800 border-1 mx-2 border-gray-200 hover:bg-gray/90">
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
                placeholder="Search contacts by name, email or company..."
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

    {
      filteredContacts.length !== 0 && (
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          onClick={() => setContactsView("grid")}
          className={`flex justify-center px-4 py-2 ${
            contactsView === "grid" ? "bg-primary" : "bg-dark"
          } text-sm font-medium border border-gray-200 rounded-s-lg hover:bg-black hover:text-[#101827]`}
          >
               <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_114_59)">
                    <path
                      d="M7 0.967148H4C2.93913 0.967148 1.92172 1.38817 1.17157 2.13759C0.421427 2.88701 0 3.90344 0 4.96328L0 7.96038C0 9.02023 0.421427 10.0367 1.17157 10.7861C1.92172 11.5355 2.93913 11.9565 4 11.9565H7C8.06087 11.9565 9.07828 11.5355 9.82843 10.7861C10.5786 10.0367 11 9.02023 11 7.96038V4.96328C11 3.90344 10.5786 2.88701 9.82843 2.13759C9.07828 1.38817 8.06087 0.967148 7 0.967148V0.967148ZM9 7.96038C9 8.49031 8.78929 8.99852 8.41421 9.37323C8.03914 9.74794 7.53043 9.95845 7 9.95845H4C3.46957 9.95845 2.96086 9.74794 2.58579 9.37323C2.21071 8.99852 2 8.49031 2 7.96038V4.96328C2 4.43336 2.21071 3.92515 2.58579 3.55044C2.96086 3.17573 3.46957 2.96522 4 2.96522H7C7.53043 2.96522 8.03914 3.17573 8.41421 3.55044C8.78929 3.92515 9 4.43336 9 4.96328V7.96038Z"
                      fill="#EDEDED"
                    />
                    <path
                      d="M19.9997 0.967148H16.9998C15.9389 0.967148 14.9215 1.38817 14.1713 2.13759C13.4212 2.88701 12.9998 3.90344 12.9998 4.96329V7.96039C12.9998 9.02023 13.4212 10.0367 14.1713 10.7861C14.9215 11.5355 15.9389 11.9565 16.9998 11.9565H19.9997C21.0606 11.9565 22.078 11.5355 22.8282 10.7861C23.5783 10.0367 23.9997 9.02023 23.9997 7.96039V4.96329C23.9997 3.90344 23.5783 2.88701 22.8282 2.13759C22.078 1.38817 21.0606 0.967148 19.9997 0.967148V0.967148ZM21.9997 7.96039C21.9997 8.49031 21.789 8.99853 21.414 9.37324C21.0389 9.74795 20.5302 9.95846 19.9997 9.95846H16.9998C16.4693 9.95846 15.9606 9.74795 15.5855 9.37324C15.2105 8.99853 14.9998 8.49031 14.9998 7.96039V4.96329C14.9998 4.43337 15.2105 3.92515 15.5855 3.55044C15.9606 3.17573 16.4693 2.96522 16.9998 2.96522H19.9997C20.5302 2.96522 21.0389 3.17573 21.414 3.55044C21.789 3.92515 21.9997 4.43337 21.9997 4.96329V7.96039Z"
                      fill="#EDEDED"
                    />
                    <path
                      d="M7 13.9546H4C2.93913 13.9546 1.92172 14.3756 1.17157 15.125C0.421427 15.8745 0 16.8909 0 17.9507L0 20.9478C0 22.0077 0.421427 23.0241 1.17157 23.7735C1.92172 24.523 2.93913 24.944 4 24.944H7C8.06087 24.944 9.07828 24.523 9.82843 23.7735C10.5786 23.0241 11 22.0077 11 20.9478V17.9507C11 16.8909 10.5786 15.8745 9.82843 15.125C9.07828 14.3756 8.06087 13.9546 7 13.9546ZM9 20.9478C9 21.4778 8.78929 21.986 8.41421 22.3607C8.03914 22.7354 7.53043 22.9459 7 22.9459H4C3.46957 22.9459 2.96086 22.7354 2.58579 22.3607C2.21071 21.986 2 21.4778 2 20.9478V17.9507C2 17.4208 2.21071 16.9126 2.58579 16.5379C2.96086 16.1632 3.46957 15.9527 4 15.9527H7C7.53043 15.9527 8.03914 16.1632 8.41421 16.5379C8.78929 16.9126 9 17.4208 9 17.9507V20.9478Z"
                      fill="#EDEDED"
                    />
                    <path
                      d="M19.9997 13.9546H16.9998C15.9389 13.9546 14.9215 14.3756 14.1713 15.125C13.4212 15.8745 12.9998 16.8909 12.9998 17.9507V20.9478C12.9998 22.0077 13.4212 23.0241 14.1713 23.7735C14.9215 24.523 15.9389 24.944 16.9998 24.944H19.9997C21.0606 24.944 22.078 24.523 22.8282 23.7735C23.5783 23.0241 23.9997 22.0077 23.9997 20.9478V17.9507C23.9997 16.8909 23.5783 15.8745 22.8282 15.125C22.078 14.3756 21.0606 13.9546 19.9997 13.9546ZM21.9997 20.9478C21.9997 21.4778 21.789 21.986 21.414 22.3607C21.0389 22.7354 20.5302 22.9459 19.9997 22.9459H16.9998C16.4693 22.9459 15.9606 22.7354 15.5855 22.3607C15.2105 21.986 14.9998 21.4778 14.9998 20.9478V17.9507C14.9998 17.4208 15.2105 16.9126 15.5855 16.5379C15.9606 16.1632 16.4693 15.9527 16.9998 15.9527H19.9997C20.5302 15.9527 21.0389 16.1632 21.414 16.5379C21.789 16.9126 21.9997 17.4208 21.9997 17.9507V20.9478Z"
                      fill="#EDEDED"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_114_59">
                      <rect
                        width="24"
                        height="23.9768"
                        fill="white"
                        transform="translate(0 0.967148)"
                      />
                    </clipPath>
                  </defs>
                </svg>
          </button>
           <button
              type="button"
              onClick={() => setContactsView("list")}
              className={`flex justify-center px-4 py-2  ${
                contactsView === "list" ? "bg-primary" : "bg-dark"
              } text-sm font-medium border border-gray-200 rounded-e-lg hover:bg-black hover:text-[#101827] focus:z-10`}
            >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_114_69)">
                <path
                  d="M7 6.96262H23C23.2652 6.96262 23.5196 6.85736 23.7071 6.67001C23.8946 6.48265 24 6.22855 24 5.96359C24 5.69863 23.8946 5.44452 23.7071 5.25716C23.5196 5.06981 23.2652 4.96455 23 4.96455H7C6.73478 4.96455 6.48043 5.06981 6.29289 5.25716C6.10536 5.44452 6 5.69863 6 5.96359C6 6.22855 6.10536 6.48265 6.29289 6.67001C6.48043 6.85736 6.73478 6.96262 7 6.96262Z"
                  fill="white"
                />
                <path
                  d="M23 11.9572H7C6.73478 11.9572 6.48043 12.0624 6.29289 12.2498C6.10536 12.4372 6 12.6913 6 12.9562C6 13.2212 6.10536 13.4753 6.29289 13.6627C6.48043 13.85 6.73478 13.9553 7 13.9553H23C23.2652 13.9553 23.5196 13.85 23.7071 13.6627C23.8946 13.4753 24 13.2212 24 12.9562C24 12.6913 23.8946 12.4372 23.7071 12.2498C23.5196 12.0624 23.2652 11.9572 23 11.9572Z"
                  fill="white"
                />
                <path
                  d="M23 18.9507H7C6.73478 18.9507 6.48043 19.056 6.29289 19.2433C6.10536 19.4307 6 19.6848 6 19.9498C6 20.2147 6.10536 20.4688 6.29289 20.6562C6.48043 20.8436 6.73478 20.9488 7 20.9488H23C23.2652 20.9488 23.5196 20.8436 23.7071 20.6562C23.8946 20.4688 24 20.2147 24 19.9498C24 19.6848 23.8946 19.4307 23.7071 19.2433C23.5196 19.056 23.2652 18.9507 23 18.9507Z"
                  fill="white"
                />
                <path
                  d="M2 7.96134C3.10457 7.96134 4 7.06677 4 5.96327C4 4.85977 3.10457 3.96521 2 3.96521C0.89543 3.96521 0 4.85977 0 5.96327C0 7.06677 0.89543 7.96134 2 7.96134Z"
                  fill="white"
                />
                <path
                  d="M2 14.9549C3.10457 14.9549 4 14.0603 4 12.9568C4 11.8533 3.10457 10.9588 2 10.9588C0.89543 10.9588 0 11.8533 0 12.9568C0 14.0603 0.89543 14.9549 2 14.9549Z"
                  fill="white"
                />
                <path
                  d="M2 21.9475C3.10457 21.9475 4 21.0529 4 19.9494C4 18.8459 3.10457 17.9514 2 17.9514C0.89543 17.9514 0 18.8459 0 19.9494C0 21.0529 0.89543 21.9475 2 21.9475Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_114_69">
                  <rect
                    width="24"
                    height="23.9768"
                    fill="white"
                    transform="translate(0 0.968117)"
                  />
                </clipPath>
              </defs>
            </svg>
          </button>
      </div>
      )
    }
      

      {/* Results */}
      {
        filteredContacts.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
             <h3 className="text-lg font-semibold text-foreground mb-2">No contacts found</h3>
              <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first contact'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
            <Link href="/contacts/add">
              <Button>Add Your First Contact</Button>
            </Link>
          )}
          </div>
        ) : (
           <ContactsTable
              contacts={filteredContacts}
              onContactsChange={async () => setContacts(await storage.getContacts())}
              alignment={contactsView}
            />
        )
      }

      {/* Export Dialog */}
      <ExportContactsDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        contacts={filteredContacts}
      />

      {/* Import contact dialog */}
      <ImportContactModal
          open={showImportContactModal}
          onOpenChange={setShowImportContactModal}
          onImportComplete={(contacts) => {
            setShowImportContactModal(false)
            if (contacts.length > 0) {
             setContacts(contacts)
            }
        }}
      />
    </div>
  );
}
