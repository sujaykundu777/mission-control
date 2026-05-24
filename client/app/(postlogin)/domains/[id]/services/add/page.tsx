import { AddServiceForm } from "@/components/domains/add-service-form";

interface AddServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function AddServicePage({ params }: AddServicePageProps) {
  const { id } = await params;

  return <AddServiceForm domainId={id} />;
}
