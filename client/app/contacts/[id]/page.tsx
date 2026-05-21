import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ContactDetailPage } from "@/components/contacts/contact-detail-page";

export default function ClientPage() {
  return (
    <DashboardLayout>
      <ContactDetailPage />
    </DashboardLayout>
  );
}
