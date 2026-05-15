"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Client, Contact, Domain } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit2, Trash2, Link as LinkIcon, Sparkles, Loader } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"
import {generateContactSummary} from '@/lib/ai/contact-summary';
import StreamingText from "../ui/streaming-text";

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

export function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  // const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      setIsLoading(true);
      const foundContact = await storage.getContactById(contactId);
      if (foundContact) {
        setContact(foundContact);
        if (foundContact.summary) setSummary(foundContact.summary);
        const contactDomains = storage.getContactDomains(contactId);
        setDomains(contactDomains);
      } else {
        toast.error('Contact not found')
        router.push("/contacts");
      }
      setIsLoading(false);
    };
    fetchContact();
  }, [contactId, router, toast]);


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

  const handleGenerateSummary = async () => {
    if (!contact) return;
    
    try {
      setIsGeneratingSummary(true);
      const generatedSummary = await generateContactSummary(contact, domains);

      await storage.updateContact(contact.id,{
        summary: generatedSummary
      }).then(() => {
        setSummary(generatedSummary);
        toast.success('Client summary generated successfully')
      }).catch((err) => {
        throw new Error(err);
      })
    }
    catch (error) {
      console.log('Error Generating Summary', error);
      toast.error('Failed to generate summary. Please Try Again')
    } finally {
      setIsGeneratingSummary(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!contact) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/contacts">
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contacts
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {contact.name}
              </h1>
              <Badge className={getStatusColor(contact.status)}>
                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">  Contact ID : {contact.contactId}</p>
          </div>
          <div className="flex gap-2">
              {/* Delete Button */}
            {/* <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-destructive hover:bg-destructive/90"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Client
              </Button>
            </div> */}
            <Link href={`/contacts/${contactId}/edit`}>
              <Button className="bg-primary hover:bg-primary/90">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
           
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        <TabsTrigger value="other">Other</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
         <div className="py-4">

            {/* AI Summary */}
            <Card className="p-6 my-2 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Contact Summary
                </h2>
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                  >
                    {isGeneratingSummary ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Summary
                      </>
                    )}
                  </Button>
              </div>
              {
                summary ? (
                   <>
                     {/* {summary}
                     */}
                     <StreamingText text={summary} />
                    </>
                ) : (
                  <p className="text-muted-foreground italic">
                    Click "Generate Summary" to create an AI-powered summary of this contact
                  </p>
                )
              }
            </Card>

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
                <p className="text-foreground">{contact.email}</p>
              </div>
              {contact.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Phone
                  </p>
                  <p className="text-foreground">{contact.phone}</p>
                </div>
              )}

              {
                contact.gender && (
                   <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Gender
                  </p>
                  <p className="text-foreground">{contact.gender}</p>
                </div>
                )
              }

              {
                contact.dob && (
                   <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Date of birth
                  </p>
                  <p className="text-foreground">{contact.dob ? new Date(contact.dob).toLocaleDateString() : ''}</p>
                </div>
                )
              }
            </div>
          </Card>

            {/* Work Information */}
            {(contact.company || contact.industry || contact.website) && (
              <Card className="p-6 my-2 bg-card border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Work Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contact.company && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Company
                      </p>
                      <p className="text-foreground">{contact.company}</p>
                    </div>
                  )}
                  {contact.industry && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Industry
                      </p>
                      <p className="text-foreground">{contact.industry}</p>
                    </div>
                  )}
                  {contact.website && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Website
                      </p>
                      <a
                        href={contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {contact.website}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Billing Information */}
            {(contact.billingAddress ||
              contact.billingEmail ||
              contact.billingPhone) && (
              <Card className="p-6 my-2 bg-card border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Billing Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contact.billingAddress && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Billing Address
                      </p>
                      <p className="text-foreground whitespace-pre-wrap">
                        {contact.billingAddress}
                      </p>
                    </div>
                  )}
                  {contact.billingEmail && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Billing Email
                      </p>
                      <p className="text-foreground">{contact.billingEmail}</p>
                    </div>
                  )}
                  {contact.billingPhone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Billing Phone
                      </p>
                      <p className="text-foreground">{contact.billingPhone}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}


              {/* Custom Fields */}
              {contact.customFields.length > 0 && (
                <Card className="p-6 my-2 bg-card border-border">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Custom Fields
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contact.customFields.map((field, index) => (
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

        </div>

      </TabsContent>
      <TabsContent value="notes">

          <div className="py-4">
                {/* Notes */}
                {contact.notes && (
                  <Card className="p-6 bg-card border-border">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Notes</h2>
                    <p className="text-foreground whitespace-pre-wrap">{contact.notes}</p>
                  </Card>
                )}
          </div>

      </TabsContent>

      <TabsContent value="subscriptions">
         
          <div className="py-4">
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
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

          </div>

      </TabsContent>

       <TabsContent value="other">

            <div className="py-4">
            
            {/* Metadata */}
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">Metadata</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Created
                    </p>
                    <p className="text-foreground">
                      {new Date(contact.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Last Updated
                    </p>
                    <p className="text-foreground">
                      {new Date(contact.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

            </div>
       </TabsContent>
    </Tabs>

    </div>
  );
}
