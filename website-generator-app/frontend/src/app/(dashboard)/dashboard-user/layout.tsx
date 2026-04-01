import DashboardLayoutClient from "../components/DashboardLayoutClient";

import { redirect } from "next/navigation";
import UserProviderWrapper from "../components/UseProviderWrapper";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session exists, redirect to home page
  if (!session) {
    redirect("/");
  }

  // Extract user info to display on dashboard
  const { data: { user }} = await supabase.auth.getUser();
  if (!user) redirect("/");
  
  const username: string =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    (user.email ? user.email.split("@")[0] : "User");
  const email: string = user.email ?? "No Email";
  const avatar: string | null = user.user_metadata?.avatar_url ?? null;
  

  return (
    <UserProviderWrapper user = {{ id: user.id, username, email, avatar}}>
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
