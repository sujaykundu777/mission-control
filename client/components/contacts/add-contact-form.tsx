"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Contact, CustomField } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Calendar1Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"

export function AddContactForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    jobTitle: "",
    company: "",
    industry: "",
    website: "",
    billingAddress: "",
    billingEmail: "",
    billingPhone: "",
    status: "active" as const,
    customFields: [] as CustomField[],
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | HTMLInputElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
        ...prev,
            [name]: value,
        }));
  };

  // Add custom field
  const handleAddCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { key: "", value: "" }],
    }));
  };

  // Update Custom Field
  const handleUpdateCustomField = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) =>
        i === index ? { ...cf, [field]: value } : cf,
      ),
    }));
  };

  // Delete Custom Field
  const handleRemoveCustomField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  // On submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        toast.warning('Name and email are required fields');
        setIsSubmitting(false);
        return;
      }

      const existingContacts = await storage.getContacts();
      const newContactCount = `CL000` + (existingContacts.length + 1); 
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        contactId: newContactCount,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
        jobTitle: formData.jobTitle || undefined,
        company: formData.company || undefined,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        billingAddress: formData.billingAddress || undefined,
        billingEmail: formData.billingEmail || undefined,
        billingPhone: formData.billingPhone || undefined,
        status: formData.status,
        customFields: formData.customFields.filter((cf) => cf.key && cf.value),
        notes: formData.notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storage.addContact(newContact).then(() => {
        toast.success('Contact added successfully');
        router.push(`/contacts/${newContact.id}`);
      });

   
    } catch (error) {
      console.error("Error Adding Contact", error);
      toast.error('Failed to add contact. Please try again.')
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-foreground">Add New Contact</h1>
        <p className="text-muted-foreground mt-2">
          Create a new contact profile with all relevant information
        </p>
      </div>

      <form className="space-y-2" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Name *
              </label>
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
              <label className="block text-sm font-medium text-foreground mb-2">
                Email *
              </label>

              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="johndoe@gmail.com"
                className="bg-background border-border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9430000032"
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

            {/* DOB */}
            <div className="grid grid-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Date of birth
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-40 justify-start font-normal bg-background border-border"
                  >
                    <Calendar1Icon className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleDateString() : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                 <div className="w-auto">
                  <Calendar
                    mode="single"
                    selected={date}
                    defaultMonth={date}
                    className='text-foreground text-sm mb-2 font-medium'
                    onSelect={(date) => {
                      setDate(date);
                      setFormData((prev) => ({
                        ...prev,
                        dob: date ? date.toLocaleDateString('en-CA') : "",
                      }));
                      setOpen(false);
                    }}
                    autoFocus
                  />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </Card>
        {/* Company Information */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Work Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                 Job Title
              </label>
              <Input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                  className="bg-background border-border"
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Name
              </label>
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
              <label className="block text-sm font-medium text-foreground mb-2">
                Industry
              </label>
              <Input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="Technology"
                className="bg-background border-border"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Website
              </label>
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
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Billing Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Billing Address
              </label>
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
              <label className="block text-sm font-medium text-foreground mb-2">
                Billing Email
              </label>
              <Input
                type="email"
                name="billingEmail"
                value={formData.billingEmail}
                onChange={handleChange}
                placeholder="billing@example.com"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Billing Phone
              </label>
              <Input
                type="tel"
                name="billingPhone"
                value={formData.billingPhone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="bg-background border-border"
              />
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Additional Notes
          </h2>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any additional notes or information about this contact..."
            className="bg-background border-border"
            rows={4}
          />
        </Card>

        {/* Custom Fields */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Custom Fields
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomField}
              className="border-border"
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
                  onChange={(e) =>
                    handleUpdateCustomField(index, "key", e.target.value)
                  }
                  className="bg-background border-border flex-1"
                />
                <Input
                  placeholder="Field value"
                  value={field.value}
                  onChange={(e) =>
                    handleUpdateCustomField(index, "value", e.target.value)
                  }
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

        {/* Form Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/contacts">
            <Button type="button" variant="outline" className="border-border">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Contact..." : "Add Contact"}
          </Button>
        </div>
      </form>
    </div>
  );
}
