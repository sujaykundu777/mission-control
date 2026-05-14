'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Contact, CustomField, Domain} from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { storage } from "@/lib/storage";
import { Textarea } from '@/components/ui/textarea'

import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function EditContactForm() {
    const router = useRouter();
    const params = useParams();
    const contactId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [contact, setContact] = useState<Contact | null>(null);
    const [domains, setDomains] = useState<Domain[]>([]);
    

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        status: 'active',
        company: '',
        industry: '',
        website: '',
        billingAddress: '',
        billingEmail: '',
        billingPhone: '',
        customFields: [] as CustomField[],
        notes: '',
    });

    useEffect(() => {
        const fetchContact = async () => {
            setIsLoading(true);

            const foundContact = await storage.getContactById(contactId);

            if (foundContact) {
                setContact(foundContact)
                const clientDomains = storage.getContactDomains(contactId);
                setDomains(clientDomains);
                setFormData({
                    name: foundContact.name,
                    email: foundContact.email,
                    phone: foundContact.phone || '',
                    gender: foundContact.gender || '',
                    status: foundContact.status,
                    company: foundContact.company || '',
                    industry: foundContact.industry || '',
                    website: foundContact.website || '',
                    billingAddress: foundContact.billingAddress || '',
                    billingEmail: foundContact.billingEmail || '',
                    billingPhone: foundContact.billingPhone || '',
                    customFields: foundContact.customFields,
                    notes: foundContact.notes || ''
                });
            } else {
                toast.error('Contact not found');
                router.push('/contacts');
            }
            setIsLoading(false);
        };

        fetchContact();
    }, [contactId, router, toast]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!formData.name.trim()) {
                toast.warning('Name is a required field')
                setIsSubmitting(false);
                return;
            }

            // update the contact
            await storage.updateContact(contactId, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                gender: formData.gender || undefined,
                status: (formData.status as 'active' | 'inactive' | 'archived') || 'inactive',
                company: formData.company || undefined,
                industry: formData.industry || undefined,
                website: formData.website || undefined,
                billingAddress: formData.billingAddress || undefined,
                billingEmail: formData.billingEmail || undefined,
                billingPhone: formData.billingPhone || undefined,
                customFields: formData.customFields.filter((cf) => cf.key && cf.value),
                notes: formData.notes || undefined
            });

            toast.success('Contact updated successfully');
            router.push(`/contacts/${contactId}`);

        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Failed to update contact. Please try again')
            setIsSubmitting(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
        ...prev,
            [name]: value,
        }));
    };

    const handleAddCustomField = () => {
        setFormData((prev) => ({
            ...prev,
            customFields: [...prev.customFields, { key: '', value: '' }]
        }))
    }

    const handleUpdateCustomField = (index: number, field: 'key' | 'value', value: string) => {
        setFormData((prev) => ({
        ...prev,
        customFields: prev.customFields.map((cf, i) =>
            i === index ? { ...cf, [field]: value } : cf
        ),
        }))
    }

    const handleRemoveCustomField = (index: number) => {
        setFormData((prev) => ({
        ...prev,
        customFields: prev.customFields.filter((_, i) => i !== index),
        }))
    }

    const handleRemoveDomain = (domainId: string) => {
        storage.disassociateDomainFromClient(domainId); //todo
        setDomains(storage.getContactDomains(contactId));
        toast.success('Domain removed from contact.')
    };


    const handleDelete = async () => {
        try {
        await storage.deleteContact(contactId)
        toast.success('Contact deleted successfully');
        router.push('/contacts')
        } catch (error) {
        console.error(' Error deleting contact:', error)
        toast.error('Failed to delete contact. Please try again.')
      }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className='flex flex-row space-around'>
                    <Link href={`/contacts`}>
                        <Button variant="ghost" className='mb-4 text-muted-foreground hover:text-foreground'>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to contacts
                        </Button>
                    </Link>
                
                
                </div>
          
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='flex flex-row flex-wrap'>
                <div className='flex-1 flex-col'>
                    <h1 className='text-3xl font-bold text-foreground'> Edit Contact </h1>
                    <p className='text-muted-foreground mt-2'> Update contact information</p>
                </div>
                    {/* Form Actions */}
                 <div className="flex gap-3 justify-end">
                  
                    <div className="flex gap-3">
                           <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        className="bg-destructive hover:bg-destructive/90"
                    > 
                       <Trash2 /> Delete 
                    </Button>
                        {/* <Link href={`/contacts/${contactId}`}>
                        <Button type="button" variant="outline" className="border-border">
                            Cancel
                        </Button>
                        
                        </Link> */}
                        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : <><Save /> Save</>}
                        </Button>
                    </div>
                  </div>
                  </div>
                 {/* Basic Information */}
                <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Contact name"
                            className="bg-background border-border"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2"> Email*</label>
                        <Input 
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder='contact@example.com'
                            className="bg-background border-border"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2"> Phone </label>
                        <Input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                            className="bg-background border-border"
                        />
                    </div>

                         {/* Gender */}
                    <div>
                    <Label htmlFor="gender" className="block text-sm font-medium text-foreground mb-2"> Gender </Label>
                        <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female"> Female </SelectItem>
                            <SelectItem value="Other"> Other </SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm">
                                <option value="active"> Active </option>
                                <option value="inactive"> Inactive </option>
                                <option value="archived"> Archived </option>
                        </select>
                    </div>
                </div>
                </Card>

                {/* Company Information */}
                <Card className="p-6 bg-card border-border">
                    <h2 className="text-xl font-semibold text-foreground mb-4"> Company Information </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-foreground mb-2'> Company Name </label>
                            <Input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="Acme Corp"
                                className="bg-background border-border"
                            />
                         </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Industry</label>
                            <Input
                                type="text"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                placeholder="Technology"
                                className="bg-background border-border"
                            />
                        </div>
                        <div className='md:col-span-2'>
                            <label className='block text-sm font-medium text-foreground mb-2'> Website </label>
                            <Input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                className="bg-background border-border"
                            />
                        </div>
                    </div>
                </Card>

                {/* Billing Information */}
                <Card className='p-6 bg-card border-border'>
                    <h2 className='text-xl font-semibold text-foreground mb-4'>Billing Information</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='md:col-span-2'>
                            <label className='block text-sm font-medium text-foreground mb-2'>Billing Address</label>
                            <Textarea
                                name="billingAddress"
                                value={formData.billingAddress}
                                onChange={handleChange}
                                placeholder="Full billing address"
                                className="bg-background border-border"
                                rows={3}
                            />
                        </div>
                          <div>
                        <label className='block text-sm font-medium text-foreground mb-2'>Billing Email</label>
                        <Input
                            type="email"
                            name="billingEmail"
                            value={formData.billingEmail}
                            onChange={handleChange}
                            placeholder='billing@example.com'
                            className='bg-background border-border'
                        />
                    </div>
                        <div>
                        <label className='block text-sm font-medium text-foreground mb-2'>Billing Phone</label>
                        <Input
                            type="tel"
                            name="billingPhone"
                            value={formData.billingPhone}
                            onChange={handleChange}
                            placeholder='+1 (555) 000-0000'
                            className='bg-background border-border'
                        />
                        </div>
                    </div>
                  
                </Card>

                {/* Custom Fields */}
                <Card className='p-6 bg-card border-border'>
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-xl font-semibold text-foreground'> Custom Fields </h2>
                        <Button
                            type="button"
                            variant='outline'
                            size="sm"
                            onClick={handleAddCustomField}
                            className='border-border'
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Field
                        </Button>
                    </div>
                     <div className="space-y-3">
                    {formData.customFields.map((field, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                placeholder="Field name"
                                value={field.key}
                                onChange={(e) => handleUpdateCustomField(index, 'key', e.target.value)}
                                className="bg-background border-border flex-1"
                            />
                            <Input
                                placeholder="Field value"
                                value={field.value}
                                onChange={(e) => handleUpdateCustomField(index, 'value', e.target.value)}
                                className="bg-background border-border flex-1"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCustomField(index)}
                                className="text-destructive hover:text-destructive"
                            >
                            <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    </div>
                </Card>


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
                <Card className="p-6 bg-card border-border">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Additional Notes</h2>
                    <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Add any additional notes or information about this client..."
                        className="bg-background border-border"
                        rows={4}
                    />
                </Card>

                    {/* Form Actions */}
                 <div className="flex gap-3 justify-end">
                  
                    <div className="flex gap-3">
                        <Link href={`/contacts/${contactId}`}>
                        <Button type="button" variant="outline" className="border-border">
                            Cancel
                        </Button>
                        </Link>
                        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                  </div>

            </form>
            {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                        <AlertDialogDescription>
                        Are you sure you want to delete this contact? This action cannot be undone. Associated domains will be unlinked from this contact.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                        onClick={async () => await handleDelete()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                        Delete
                        </AlertDialogAction>
                    </div>
                    </AlertDialogContent>
                </AlertDialog>
                        
        </div>
    )
}