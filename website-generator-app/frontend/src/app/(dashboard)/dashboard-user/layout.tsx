import DashboardLayoutClient from "../components/DashboardLayoutClient";

import UserProviderWrapper from "../components/UseProviderWrapper";
import { DASHBOARD_DEMO_USER } from "./mock-data";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProviderWrapper user={DASHBOARD_DEMO_USER}>
      <div className="dashboard-user-shell relative min-h-dvh bg-background text-foreground">
        {/* Keep dashboard background consistent during overscroll/bounce */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-background" />
        {/* DashboardLayoutClient handles sidebar and content with responsive margins */}
        <div className="relative z-10">
          <DashboardLayoutClient>{children}</DashboardLayoutClient>
        </div>
      </div>
    </UserProviderWrapper>
  );
}
