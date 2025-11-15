
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

  const user = session.user;
  const username =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    (user.email ? user.email.split("@")[0] : "User");

  return (
    <UserProviderWrapper username = {username}>
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
