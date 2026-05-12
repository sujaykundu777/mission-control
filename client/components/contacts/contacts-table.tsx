"use client";

import { Client, Contact } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ContactsTableProps {
  contacts: Contact[];
  onContactsChange?: () => void;
  alignment: 'grid' | 'list'
}

export function ContactsTable({ contacts, onContactsChange, alignment }: ContactsTableProps) {
  // const [deleteId, setDeleteId] = useState<string | null>(null);

  // const handleDelete = () => {
  //   if (deleteId) {
  //     storage.deleteClient(deleteId);
  //     setDeleteId(null);
  //     onClientsChange?.();
  //   }
  // };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 hover:bg-green-500/20";
      case "inactive":
        return "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20";
      case "archived":
        return "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDomainsCount = (contactId: string) => {
    return storage.getContactDomains(contactId).length;
  };

  if (contacts.length === 0) {
    return null;
  }

  return (
    <>
      {/* <div className="grid gap-4"> */}
      <div className={`w-[100%] grid gap-10 ${
        alignment==="grid" ? "grid-cols-1 md:grid-cols-3 lg-grid-cols-3" : null
      }`}>
        {contacts.map((c: Contact) => (
          <Card
            key={c.id}
            className="p-4 bg-card border-border hover:border-primary/50 transition-colors"
          >
            {alignment === 'list' && (
             <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {c.name}
                  </h3>
                  <Badge className={getStatusColor(c.status)}>
                    {c.status.charAt(0).toUpperCase() +
                      c.status.slice(1)}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground text-xs mb-1">
                      Email
                    </p>
                    <p className="truncate">{c.email}</p>
                  </div>
                  {c.company && (
                    <div>
                      <p className="font-medium text-foreground text-xs mb-1">
                        Company
                      </p>
                      <p className="truncate">{c.company}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground text-xs mb-1">
                      Associated Domains
                    </p>
                    <p className="font-semibold text-foreground">
                      {getDomainsCount(c.id)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Link href={`/contacts/${c.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/contacts/${c.id}/edit`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </Link>
                {/* <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(client.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button> */}
              </div>
            </div>
            )}

            {alignment === 'grid' && (
              <>
                <Badge className={getStatusColor(c.status)}>
                  {c.status.charAt(0).toUpperCase() +
                    c.status.slice(1)}
                </Badge>
                 <CardHeader>
                 
                   <CardTitle>{c.name}</CardTitle>
                   <CardDescription> {c.company} </CardDescription>
                   
                 </CardHeader>
                 <CardContent>
                  <p className="truncate">{c.email}</p>
                 </CardContent>
                   <CardFooter>
                      <Link href={`/contacts/${c.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/contacts/${c.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(client.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button> */}
                      
                  </CardFooter>
              </>
            )}
            
          </Card>
        ))}
      </div>

      {/* <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be
              undone. Associated domains will be unlinked from this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog> */}
    </>
  );
}
