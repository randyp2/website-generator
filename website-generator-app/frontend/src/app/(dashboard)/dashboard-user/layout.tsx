import DashboardMotionWrapper from "./components/DashboardMotionWrapper";
import SidebarNavigation from "./components/SidebarNavigation";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-sky-50/30">
      {/* Sidebar Navigation */}
      <SidebarNavigation />

      {/* Motion Wrapper handles animations */}
      <main className="md:ml-[280px] transition-all duration-300">
        <DashboardMotionWrapper>{children}</DashboardMotionWrapper>
      </main>
    </div>
  );
}
