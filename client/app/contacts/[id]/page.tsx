import { AppLayout } from "@/components/layout/app-layout";
import { ContactDetailPage } from "@/components/contacts/contact-detail-page";

export default function ClientPage() {
  return (
    <AppLayout>
      <ContactDetailPage />
    </AppLayout>
  );
}
