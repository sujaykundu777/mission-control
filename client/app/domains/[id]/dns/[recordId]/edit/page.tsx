import { AppLayout } from "@/components/layout/app-layout";
import { AddDNSForm } from "@/components/domains/add-dns-form";

interface EditDNSPageProps {
  params: Promise<{ id: string; recordId: string }>;
}

export default async function EditDNSPage({ params }: EditDNSPageProps) {
  const { id, recordId } = await params;

  return (
    <AppLayout>
      <AddDNSForm domainId={id} recordId={recordId} isEdit={true} />
    </AppLayout>
  );
}
