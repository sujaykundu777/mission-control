import { DomainDetailPage } from "@/components/domains/domain-detail-page";

interface DomainPageProps {
  params: Promise<{ id: string }>;
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { id } = await params;

  return <DomainDetailPage domainId={id} />;
}
