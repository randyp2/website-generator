
import { UserContext } from "@/context/UserContext";
import DashboardMotionWrapper from "../components/DashboardMotionWrapper";
import SidebarNavigation from "../components/SidebarNavigation";

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
  const user = session.user;
  const username: string =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    (user.email ? user.email.split("@")[0] : "User");
  const email: string = user.email ?? "No Email";
  const avatar: any = user.user_metadata?.avatar_url ?? null;
  

  return (
    <UserProviderWrapper user = {{ username, email, avatar}}>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-sky-50/30">
        {/* Sidebar Navigation */}
        <SidebarNavigation />

        {/* Motion Wrapper handles animations */}
        <main className="md:ml-[280px] transition-all duration-300">
          {/* <div>
          {"User: " + user.email + " | Access Token: " + accessToken}
        </div> */}
          <DashboardMotionWrapper>{children}</DashboardMotionWrapper>
        </main>
      </div>
    </UserProviderWrapper>
  );
}
