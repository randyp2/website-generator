
import DashboardMotionWrapper from "./components/DashboardMotionWrapper";
import SidebarNavigation from "./components/SidebarNavigation";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // // If no session exists, redirect to login page
  // if (!session) {
  //   redirect("/login");
  // }
   

  return (
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
  );
}
