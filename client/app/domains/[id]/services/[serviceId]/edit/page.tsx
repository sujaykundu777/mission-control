import { AppLayout } from '@/components/layout/app-layout'
import { AddServiceForm } from '@/components/domains/add-service-form'

interface EditServicePageProps {
  params: Promise<{ id: string; serviceId: string }>
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id, serviceId } = await params

  return (
    <AppLayout>
      <AddServiceForm domainId={id} serviceId={serviceId} isEdit={true} />
    </AppLayout>
  )
}
