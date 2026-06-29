"use client";

import React from "react";
import Link from "next/link";
import SidebarNavigation from "./SidebarNavigation";
import DashboardMotionWrapper from "./DashboardMotionWrapper";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import HeaderCreditsChip from "./HeaderCreditsChip";
import DashboardQueryProvider from "./DashboardQueryProvider";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

interface Breadcrumb {
  label: string;
  href: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  portfolios: "My Portfolios",
  create: "Create New",
  publish: "Publish",
  billing: "Billing",
  settings: "Settings",
  profile: "Profile",
  security: "Security",
  history: "History",
  upload: "Upload",
  review: "Review",
  style: "Style",
  refine: "Refine",
  cancel: "Cancel",
  success: "Success",
  verification: "Verification",
};

const getBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Breadcrumb[] = [];
  let href = "";

  for (const segment of segments) {
    href += `/${segment}`;
    const label =
      SEGMENT_LABELS[segment] ??
      segment
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href });
  }

  return crumbs;
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

  const breadcrumbs = getBreadcrumbs(pathname);

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
            <div className="flex h-11 items-center justify-between px-4 md:px-5">
              <div className="flex min-w-0 items-center">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open sidebar"
                  title="Open sidebar"
                  className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:cursor-pointer hover:text-foreground md:hidden"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
                  title={collapsed ? "Open sidebar" : "Close sidebar"}
                  className="hidden h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:cursor-pointer hover:text-foreground md:inline-flex"
                >
                  {collapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </button>

                <span className="mx-3 h-5 w-px bg-border" aria-hidden />

                <nav className="flex min-w-0 items-center gap-1.5 truncate">
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <React.Fragment key={crumb.href}>
                        {index > 0 && (
                          <span
                            className="shrink-0 text-sm text-muted-foreground/50"
                            aria-hidden
                          >
                            /
                          </span>
                        )}
                        <Link
                          href={crumb.href}
                          className={`truncate text-base font-medium transition-colors hover:cursor-pointer hover:underline ${
                            isLast
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {crumb.label}
                        </Link>
                      </React.Fragment>
                    );
                  })}
                </nav>
              </div>

              <HeaderCreditsChip />
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
    <DashboardQueryProvider>
      <SidebarProvider>
        <DashboardLayoutClientInner>{children}</DashboardLayoutClientInner>
      </SidebarProvider>
    </DashboardQueryProvider>
  );
};

export default DashboardLayoutClient;
