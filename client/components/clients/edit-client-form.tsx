'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Client, CustomField} from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '../ui/use-toast';
import { storage } from "@/lib/storage";

export function EditClientForm() {
    const router = useRouter();
    const params = useParams();
    const {toast} = useToast();
    const clientId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [client, setClient] = useState<Client | null>(null);

    const [formData, setFormData] = useState({
        name: ''
    });

    useEffect(() => {
        setIsLoading(true);

        const foundClient = storage.getClientById(clientId);

        if (foundClient) {
            setClient(foundClient)
            setFormData({
                name: foundClient.name,
            });
        } else {
            toast({
                title: 'Error',
                description: 'Client not found',
                variant: 'destructive'
            });
            router.push('/clients');
        }
        setIsLoading(false);

    }, [clientId, router, toast]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!formData.name.trim()) {
                toast({
                    title: 'Validation Error',
                    description: 'Name is a required field',
                    variant: 'destructive'
                });
                setIsSubmitting(false);
                return;
            }

            // update the client
            storage.updateClient(clientId, {
                name: formData.name
            });

            toast({
                title: 'success',
                description: 'Client updated successfully'
            });
            router.push(`/clients/${clientId}`);

        } catch (error) {
            console.error('[v0] Error updating client:', error);
            toast({
                title: 'Error',
                description: 'Failed to update client. Please try again',
                variant: 'destructive'
            });
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href={`/clients/${clientId}`}>
                    <Button variant="ghost" className='mb-4 text-muted-foreground hover:text-foreground'>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to client
                    </Button>
                </Link>
                <h1 className='text-3xl font-bold text-foreground'> Edit Client </h1>
                <p className='text-muted-foreground mt-2'> Update client information</p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
                
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
                        placeholder="Client name"
                        className="bg-background border-border"
                        required
                    />
                    </div>
                </div>
                </Card>

                <div className='flex gap-3 justify-between'>
                      <div className="flex gap-3">
                        <Link href={`/clients/${clientId}`}>
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
        </div>
    )
}