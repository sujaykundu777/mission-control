import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AllContactsPage } from "@/components/contacts/all-contacts-page";

export default function ContactsPage() {
  return (
    <DashboardLayout>
      <AllContactsPage />
    </DashboardLayout>
  );
}
