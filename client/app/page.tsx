import { AppLayout } from "@/components/layout/app-layout";
import ContactManagerLanding from "@/components/landing/ContactManagerLanding";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

export default function Page() {
  return (
    <AppLayout>
      <ContactManagerLanding />
      {/* <DashboardPage /> */}
    </AppLayout>
  );
}
