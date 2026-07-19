import DashboardLayoutClient from "../components/DashboardLayoutClient";
import DashboardProfileProvider from "../components/DashboardProfileProvider";
import { getDashboardProfileState } from "./dashboard-profile.server";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { authUser, profile } = await getDashboardProfileState();

    return (
        <DashboardProfileProvider authUser={authUser} initialProfile={profile}>
            <div className="dashboard-user-shell relative h-dvh overflow-hidden bg-background text-foreground">
                <div className="pointer-events-none fixed inset-0 z-0 bg-background" />
                <div className="relative z-10 h-full">
                    <DashboardLayoutClient>{children}</DashboardLayoutClient>
                </div>
            </div>
        </DashboardProfileProvider>
    );
}
