import { UserContext } from "@/context/UserContext";
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

  // If no session exists, redirect to login page
  if (!session) {
    redirect("/login");
  }

  // Extract user info to display on dashboard
  const { data: { user }} = await supabase.auth.getUser();
  if (!user) redirect("/login");
  
  const username: string =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    (user.email ? user.email.split("@")[0] : "User");
  const email: string = user.email ?? "No Email";
  const avatar: any = user.user_metadata?.avatar_url ?? null;
  

  return (
    <UserProviderWrapper user = {{ id: user.id, username, email, avatar}}>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-sky-50/30">
        {/* DashboardLayoutClient handles sidebar and content with responsive margins */}
        <DashboardLayoutClient>{children}</DashboardLayoutClient>
      </div>
    </UserProviderWrapper>
  );
}
