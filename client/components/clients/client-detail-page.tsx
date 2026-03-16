"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Client, Domain } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Trash2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const clientId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const foundClient = storage.getClientById(clientId);
    if (foundClient) {
      setClient(foundClient);
      const clientDomains = storage.getClientDomains(clientId);
      setDomains(clientDomains);
    } else {
      toast({
        title: "Error",
        description: "Client not found.",
        variant: "destructive",
      });
      router.push("/clients");
    }
    setIsLoading(false);
  }, [clientId, router, toast]);

  const handleDelete = () => {
    try {
      storage.deleteClient(clientId);
      toast({
        title: "Success",
        description: "Client deleted successfully.",
      });
      router.push("/clients");
    } catch (error) {
      console.error("[v0] Error deleting client:", error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDomain = (domainId: string) => {
    storage.disassociateDomainFromClient(domainId);
    setDomains(storage.getClientDomains(clientId));
    toast({
      title: "Success",
      description: "Domain removed from client.",
    });
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/clients">
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {client.name}
              </h1>
              <Badge className={getStatusColor(client.status)}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">Client Profile</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/clients/${clientId}/edit`}>
              <Button className="bg-primary hover:bg-primary/90">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Email
            </p>
            <p className="text-foreground">{client.email}</p>
          </div>
          {client.phone && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Phone
              </p>
              <p className="text-foreground">{client.phone}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Company Information */}
      {(client.company || client.industry || client.website) && (
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {client.company && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Company
                </p>
                <p className="text-foreground">{client.company}</p>
              </div>
            )}
            {client.industry && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Industry
                </p>
                <p className="text-foreground">{client.industry}</p>
              </div>
            )}
            {client.website && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Website
                </p>
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {client.website}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Billing Information */}
      {(client.billingAddress ||
        client.billingEmail ||
        client.billingPhone) && (
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Billing Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {client.billingAddress && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Billing Address
                </p>
                <p className="text-foreground whitespace-pre-wrap">
                  {client.billingAddress}
                </p>
              </div>
            )}
            {client.billingEmail && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Billing Email
                </p>
                <p className="text-foreground">{client.billingEmail}</p>
              </div>
            )}
            {client.billingPhone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Billing Phone
                </p>
                <p className="text-foreground">{client.billingPhone}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Custom Fields */}
      {client.customFields.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Custom Fields
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {client.customFields.map((field, index) => (
              <div key={index}>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {field.key}
                </p>
                <p className="text-foreground">{field.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Associated Domains */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Associated Domains ({domains.length})
        </h2>
        {domains.length === 0 ? (
          <p className="text-muted-foreground">
            No domains associated with this client yet.
          </p>
        ) : (
          <div className="space-y-2">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between p-3 bg-background border border-border rounded-md"
              >
                <div className="flex-1 min-w-0">
                  <Link href={`/domains/${domain.id}`}>
                    <p className="font-semibold text-primary hover:underline truncate">
                      {domain.name}
                    </p>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Expires:{" "}
                    {new Date(domain.expirationDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDomain(domain.id)}
                  className="text-muted-foreground hover:text-destructive ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Notes */}
      {client.notes && (
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Notes</h2>
          <p className="text-foreground whitespace-pre-wrap">{client.notes}</p>
        </Card>
      )}

      {/* Metadata */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Created
            </p>
            <p className="text-foreground">
              {new Date(client.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Last Updated
            </p>
            <p className="text-foreground">
              {new Date(client.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Delete Button */}
      <div className="flex justify-end">
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="bg-destructive hover:bg-destructive/90"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Client
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
      </AlertDialog>
    </div>
  );
}
