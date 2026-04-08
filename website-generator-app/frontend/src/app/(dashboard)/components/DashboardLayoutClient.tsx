"use client";

import React from "react";
import SidebarNavigation from "./SidebarNavigation";
import DashboardMotionWrapper from "./DashboardMotionWrapper";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

const getActiveTabLabel = (pathname: string): string => {
  const routeLabelMap: Array<{ prefix: string; label: string }> = [
    { prefix: "/dashboard-user/portfolios", label: "My Portfolios" },
    { prefix: "/dashboard-user/create", label: "Create New" },
    { prefix: "/dashboard-user/publish", label: "Publish" },
    { prefix: "/dashboard-user", label: "Dashboard" },
  ];

  const matched = routeLabelMap.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (matched) return matched.label;

  const lastSegment = pathname.split("/").filter(Boolean).pop();
  if (!lastSegment) return "Dashboard";
  return lastSegment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const DashboardLayoutClientInner: React.FC<DashboardLayoutClientProps> = ({
  children,
}) => {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const activeTabLabel = getActiveTabLabel(pathname);

  return (
    <>
      {/* Sidebar Navigation */}
      <SidebarNavigation
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area - adjusts margin based on sidebar state */}
      <main
        className={`${collapsed ? "md:ml-[72px]" : "md:ml-[248px]"} h-full overflow-hidden bg-sidebar py-2 md:py-3 transition-[margin] duration-300 ease-in-out`}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-background">
          <header className="z-30 border-b border-border bg-background">
            <div className="flex h-11 items-center px-4 md:px-5">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open sidebar"
                title="Open sidebar"
                className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleCollapse}
                aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
                title={collapsed ? "Open sidebar" : "Close sidebar"}
                className="hidden h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>

              <span className="mx-3 h-5 w-px bg-border" aria-hidden />
              <p className="truncate text-base font-medium text-foreground">
                {activeTabLabel}
              </p>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto overscroll-none py-1 md:py-1.5">
            <DashboardMotionWrapper>{children}</DashboardMotionWrapper>
          </div>
        </div>
      </main>
    </>
  );
};

const DashboardLayoutClient: React.FC<DashboardLayoutClientProps> = ({
  children,
}) => {
  return (
    <SidebarProvider>
      <DashboardLayoutClientInner>{children}</DashboardLayoutClientInner>
    </SidebarProvider>
  );
};

export default DashboardLayoutClient;
