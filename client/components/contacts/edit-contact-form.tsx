"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CustomField, Domain } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storage } from "@/lib/storage";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, Trash2, Calendar1Icon } from "lucide-react";

export function EditContactForm() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [profileImage, setProfileImage] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    status: "active",
    jobTitle: "",
    workPhone: "",
    martialStatus: "Single",
    company: "",
    industry: "",
    website: "",
    billingAddress: "",
    billingEmail: "",
    billingPhone: "",
    profileImage: "",
    customFields: [] as CustomField[],
    notes: "",
    relationshipType: "",
  });

  useEffect(() => {
    const fetchContact = async () => {
      const foundContact = await storage.getContactById(contactId);

      if (foundContact) {
        setFormData({
          name: foundContact.name,
          email: foundContact.email,
          phone: foundContact.phone || "",
          gender: foundContact.gender || "",
          dob: foundContact.dob || "",
          status: foundContact.status,
          jobTitle: foundContact.jobTitle || "",
          workPhone: foundContact.workPhone || "",
          martialStatus: foundContact.martialStatus || "",
          company: foundContact.company || "",
          industry: foundContact.industry || "",
          website: foundContact.website || "",
          billingAddress: foundContact.billingAddress || "",
          billingEmail: foundContact.billingEmail || "",
          billingPhone: foundContact.billingPhone || "",
          profileImage: foundContact.profileImage || "",
          customFields: foundContact.customFields,
          notes: foundContact.notes || "",
          relationshipType: foundContact.relationshipType || "",
        });
      } else {
        toast.error("Contact not found");
        router.push("/contacts");
      }
    };

    fetchContact();
  }, [contactId, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        toast.warning("Name is a required field");
        setIsSubmitting(false);
        return;
      }

      // update the contact
      await storage.updateContact(contactId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
        status: (formData.status as "active" | "inactive" | "archived") || "inactive",
        martialStatus:
          (formData.martialStatus as "Single" | "Married" | "Divorce" | "Widowed") || "Single",
        jobTitle: formData.jobTitle || undefined,
        workPhone: formData.workPhone || undefined,
        company: formData.company || undefined,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        billingAddress: formData.billingAddress || undefined,
        billingEmail: formData.billingEmail || undefined,
        billingPhone: formData.billingPhone || undefined,
        profileImage: formData.profileImage || undefined,
        customFields: formData.customFields.filter((cf) => cf.key && cf.value),
        notes: formData.notes || undefined,
        relationshipType: formData.relationshipType || undefined,
      });

      toast.success("Contact updated successfully");
      router.push(`/contacts/${contactId}`);
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact. Please try again");
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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

  const handleAddCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { key: "", value: "" }],
    }));
  };

  const handleUpdateCustomField = (index: number, field: "key" | "value", value: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) =>
        i === index ? { ...cf, [field]: value } : cf,
      ),
    }));
  };

  const handleRemoveCustomField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveDomain = (domainId: string) => {
    storage.disassociateDomainFromClient(domainId); //todo
    setDomains(storage.getContactDomains(contactId));
    toast.success("Domain removed from contact.");
  };

  const handleDelete = async () => {
    try {
      await storage.deleteContact(contactId);
      toast.success("Contact deleted successfully");
      router.push("/contacts");
    } catch (error) {
      console.error(" Error deleting contact:", error);
      toast.error("Failed to delete contact. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const validate = (): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    if (formData.phone && !/^\+?[1-9]\d{1,14}\s?[0-9]{1,14}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format";
    }

    if (!formData.relationshipType) {
      newErrors.relationshipType = "Relationship type is required";
    }

    return newErrors;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="space-around flex flex-row">
          <Link href={`/contacts`}>
            <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to contacts
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="flex flex-row flex-wrap">
          <div className="flex-1 flex-col">
            <h1 className="text-3xl font-bold text-foreground"> Edit Contact </h1>
            <p className="mt-2 text-muted-foreground"> Update contact information</p>
          </div>
          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-destructive hover:bg-destructive/90"
              >
                <Trash2 /> Delete
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                Name *
              </Label>
              <Input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contact name"
                className="border-border bg-background"
                required
              />
              {errors?.name && (
                <div className="mt-1 text-sm text-red-600" role="alert">
                  {errors.name}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@example.com"
                className="border-border bg-background"
                required
              />
              {errors?.email && (
                <div className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email}
                </div>
              )}
            </div>
            <div>
              <Label
                htmlFor="profileImage"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Profile Picture
              </Label>
              <div className="mt-2">
                <Input
                  id="profileImage"
                  type="file"
                  name="profileImage"
                  onChange={handleFileChange}
                  className="rounded-md border border-gray-300"
                />
                {profileImage && (
                  <img
                    src={profileImage}
                    alt="Preview"
                    className="mt-1 h-20 w-20 rounded-md object-cover"
                  />
                )}
                {errors?.profileImage && (
                  <div className="mt-1 text-sm text-red-600" role="alert">
                    {errors.profileImage}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Phone</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="border-border bg-background"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Relationship Type
              </label>
              <Select
                value={formData.relationshipType}
                onValueChange={(value) => handleSelectChange("relationshipType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friend"> Friend </SelectItem>
                  <SelectItem value="Colleague"> Colleague </SelectItem>
                  <SelectItem value="Other"> Other </SelectItem>
                </SelectContent>
              </Select>
              {errors?.relationshipType && (
                <div className="mt-1 text-sm text-red-600" role="alert">
                  {errors.relationshipType}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Gender */}
        <div>
          <Label htmlFor="gender" className="mb-2 block text-sm font-medium text-foreground">
            Gender
          </Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleSelectChange("gender", value)}
          >
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
          <label className="mb-2 block text-sm font-medium text-foreground">Date of birth</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-40 justify-start border-border bg-background font-normal"
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
                  className="mb-2 text-sm font-medium text-foreground"
                  onSelect={(date) => {
                    setDate(date);
                    setFormData((prev) => ({
                      ...prev,
                      dob: date ? date.toLocaleDateString("en-CA") : "",
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
          <label className="mb-2 block text-sm font-medium text-foreground">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="active"> Active </option>
            <option value="inactive"> Inactive </option>
            <option value="archived"> Archived </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Martial Status</label>
          <select
            name="martialStatus"
            value={formData.martialStatus}
            onChange={handleChange}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="Single"> Single </option>
            <option value="Married"> Married </option>
            <option value="Divorce"> Divorced </option>
            <option value="Widowed"> Widowed </option>
          </select>
        </div>
      </form>

      {/* Company Information */}
      <Card className="border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Company Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Job Title</label>
            <Input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="e.g. Marketing Director"
              className="border-border bg-background"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground"> Work Phone </label>
            <Input
              type="tel"
              name="workPhone"
              value={formData.workPhone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="border-border bg-background"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground"> Company Name </label>
            <Input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Acme Corp"
              className="border-border bg-background"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Industry</label>
            <Input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="Technology"
              className="border-border bg-background"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-foreground"> Website </label>
            <Input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="border-border bg-background"
            />
          </div>
        </div>
      </Card>

      {/* Billing Information */}
      <Card className="border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Billing Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Billing Address
            </label>
            <Textarea
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              placeholder="Full billing address"
              className="border-border bg-background"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Billing Email</label>
            <Input
              type="email"
              name="billingEmail"
              value={formData.billingEmail}
              onChange={handleChange}
              placeholder="billing@example.com"
              className="border-border bg-background"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Billing Phone</label>
            <Input
              type="tel"
              name="billingPhone"
              value={formData.billingPhone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="border-border bg-background"
            />
          </div>
        </div>
      </Card>

      {/* Custom Fields */}
      <Card className="border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground"> Custom Fields </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomField}
            className="border-border"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>
        <div className="space-y-3">
          {formData.customFields.map((field, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Field name"
                value={field.key}
                onChange={(e) => handleUpdateCustomField(index, "key", e.target.value)}
                className="flex-1 border-border bg-background"
              />
              <Input
                placeholder="Field value"
                value={field.value}
                onChange={(e) => handleUpdateCustomField(index, "value", e.target.value)}
                className="flex-1 border-border bg-background"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCustomField(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Associated Domains */}
      <Card className="border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Associated Domains ({domains.length})
        </h2>
        {domains.length === 0 ? (
          <p className="text-muted-foreground">No domains associated with this client yet.</p>
        ) : (
          <div className="space-y-2">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between rounded-md border border-border bg-background p-3"
              >
                <div className="min-w-0 flex-1">
                  <Link href={`/domains/${domain.id}`}>
                    <p className="truncate font-semibold text-primary hover:underline">
                      {domain.name}
                    </p>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(domain.expirationDate).toLocaleDateString()}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDomain(domain.id)}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Notes */}
      <Card className="border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Additional Notes</h2>
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any additional notes or information about this client..."
          className="border-border bg-background"
          rows={4}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone. Associated
              domains will be unlinked from this contact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
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
  );
}
