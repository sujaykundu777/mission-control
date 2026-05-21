import { AppLayout } from "@/components/layout/app-layout";
import { AddDNSForm } from "@/components/domains/add-dns-form";

interface AddDNSPageProps {
  params: Promise<{ id: string }>;
}

export default async function AddDNSPage({ params }: AddDNSPageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <AddDNSForm domainId={id} />
    </AppLayout>
  );
}
