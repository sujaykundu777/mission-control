import { AppLayout } from '@/components/layout/app-layout'
import { EditDomainForm } from '@/components/domains/edit-domain-form'

interface EditDomainPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDomainPage({ params }: EditDomainPageProps) {
  const { id } = await params

  return (
    <AppLayout>
      <EditDomainForm domainId={id} />
    </AppLayout>
  )
}
