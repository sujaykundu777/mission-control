import { AddServiceForm } from "@/components/domains/add-service-form";

interface EditServicePageProps {
  params: Promise<{ id: string; serviceId: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id, serviceId } = await params;

  return <AddServiceForm domainId={id} serviceId={serviceId} isEdit={true} />;
}
