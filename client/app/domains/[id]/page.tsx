import { AppLayout } from "@/components/layout/app-layout";
import { DomainDetailPage } from "@/components/domains/domain-detail-page";

interface DomainPageProps {
  params: Promise<{ id: string }>;
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <DomainDetailPage domainId={id} />
    </AppLayout>
  );
}
