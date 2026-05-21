"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Contact, CustomField } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Calendar1Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function AddContactForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [profileImage, setProfileImage] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    jobTitle: "",
    martialStatus: "Single" as const,
    company: "",
    industry: "",
    website: "",
    billingAddress: "",
    billingEmail: "",
    billingPhone: "",
    workPhone: "",
    status: "active" as const,
    customFields: [] as CustomField[],
    notes: "",
    relationshipType: "",
    profileImage: "",
  });

  // Country code state and options
  const [countryDial, setCountryDial] = useState("+1");
  const countryOptions = [
    { label: "United States", value: "+1" },
    { label: "India", value: "+91" },
    { label: "United Kingdom", value: "+44" },
    { label: "Canada", value: "+1" },
    { label: "Australia", value: "+61" },
  ];
  const handleCountryDialChange = (value: string) => setCountryDial(value);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
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

    if (!formData.name.trim() || !formData.email.trim()) {
      newErrors.name = "Name is required";
      newErrors.email = "Email is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        toast.warning("Name and email are required fields");
        setIsSubmitting(false);
        return;
      }

      // Combine country dial code with phone numbers
      const combinedPhone = formData.phone ? `${countryDial}${formData.phone}` : undefined;
      const combinedWorkPhone = formData.workPhone
        ? `${countryDial}${formData.workPhone}`
        : undefined;
      const combinedBillingPhone = formData.billingPhone
        ? `${countryDial}${formData.billingPhone}`
        : undefined;

      const existingContacts = await storage.getContacts();
      const newContactCount = `CL000` + (existingContacts.length + 1);
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        contactId: newContactCount,
        name: formData.name,
        email: formData.email,
        phone: combinedPhone,
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
        jobTitle: formData.jobTitle || undefined,
        workPhone: combinedWorkPhone || undefined,
        martialStatus: formData.martialStatus,
        company: formData.company || undefined,
        industry: formData.industry || undefined,
        website: formData.website || undefined,
        billingAddress: formData.billingAddress || undefined,
        billingEmail: formData.billingEmail || undefined,
        billingPhone: combinedBillingPhone || undefined,
        profileImage: formData.profileImage,
        status: formData.status,
        customFields: formData.customFields.filter((cf) => cf.key && cf.value),
        notes: formData.notes || undefined,
        relationshipType: formData.relationshipType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storage.addContact(newContact).then(() => {
        toast.success("Contact added successfully");
        router.push(`/contacts/${newContact.id}`);
      });
    } catch (error) {
      console.error("Error Adding Contact", error);
      toast.error("Failed to add contact. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/contacts">
          <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Add New Contact</h1>
        <p className="mt-2 text-muted-foreground">
          Create a new contact profile with all relevant information
        </p>
      </div>

      {/* Country Code Select */}
      <div className="mb-4">
        <Label className="mb-1 block text-sm font-medium text-foreground">Country Code</Label>
        <Select value={countryDial} onValueChange={handleCountryDialChange}>
          <SelectTrigger className="w-full">
            <SelectValue className="ml-1 text-foreground" placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {countryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form className="space-y-2" onSubmit={handleSubmit} noValidate>
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
                placeholder="johndoe@gmail.com"
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
              <Label className="mb-2 block text-sm font-medium text-foreground">Country Code</Label>
              <Select value={countryDial} onValueChange={handleCountryDialChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country code" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="National number"
                className="border-border bg-background"
              />
              {errors?.phone && (
                <div className="mt-1 text-sm text-red-600" role="alert">
                  {errors.phone}
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
              <Label className="mb-2 block text-sm font-medium text-foreground">Status</Label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-foreground">
                Martial Status
              </Label>
              <select
                name="martialStatus"
                value={formData.martialStatus}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorce">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            {/* DOB */}
            <div>
              <Label className="mb-2 block text-sm font-medium text-foreground">
                Date of birth
              </Label>
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
                      defaultMonth={date}
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
          </div>
        </Card>

        {/* Company Information */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Work Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-2 block text-sm font-medium text-foreground">Job Title</Label>
              <Input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Software Engineer"
                className="border-border bg-background"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-foreground">Company Name</Label>
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
              <Label className="mb-2 block text-sm font-medium text-foreground">Industry</Label>
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
              <Label className="mb-2 block text-sm font-medium text-foreground">Website</Label>
              <Input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="border-border bg-background"
              />
            </div>
            <div>
              <Label htmlFor="workPhone" className="mb-2 block text-sm font-medium text-foreground">
                Work Phone
              </Label>
              <Input
                id="workPhone"
                type="tel"
                name="workPhone"
                value={formData.workPhone}
                onChange={handleChange}
                placeholder="National number"
                className="border-border bg-background"
              />
              {errors?.workPhone && (
                <div className="mt-1 text-sm text-red-600" role="alert">
                  {errors.workPhone}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Billing Information */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Billing Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="mb-2 block text-sm font-medium text-foreground">
                Billing Address
              </Label>
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
              <Label className="mb-2 block text-sm font-medium text-foreground">
                Billing Email
              </Label>
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
              <Label className="mb-2 block text-sm font-medium text-foreground">
                Billing Phone
              </Label>
              <Input
                type="tel"
                name="billingPhone"
                value={formData.billingPhone}
                onChange={handleChange}
                placeholder="National number"
                className="border-border bg-background"
              />
              {errors?.billingPhone && (
                <div className="mt-1 text-sm text-red-600" role="alert">
                  {errors.billingPhone}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Additional Notes</h2>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any additional notes or information about this contact..."
            className="border-border bg-background"
            rows={4}
          />
        </Card>

        {/* Custom Fields */}
        <Card className="border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Custom Fields</h2>
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

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/contacts">
            <Button type="button" variant="outline" className="border-border">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
            {isSubmitting ? "Adding Contact..." : "Add Contact"}
          </Button>
        </div>
      </form>
    </div>
  );
}
