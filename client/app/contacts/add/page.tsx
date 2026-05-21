import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AddContactForm } from "@/components/contacts/add-contact-form";

export default function AddClientPage() {
  return (
    <DashboardLayout>
      <AddContactForm />
    </DashboardLayout>
  );
}
