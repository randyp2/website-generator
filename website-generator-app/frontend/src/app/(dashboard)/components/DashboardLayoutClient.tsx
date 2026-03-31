"use client";

import React from "react";
import SidebarNavigation from "./SidebarNavigation";
import DashboardMotionWrapper from "./DashboardMotionWrapper";
import { motion } from "framer-motion";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

const DashboardLayoutClientInner: React.FC<DashboardLayoutClientProps> = ({
  children,
}) => {
  const { collapsed, setCollapsed } = useSidebar();

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Sidebar Navigation */}
      <SidebarNavigation
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area - adjusts margin based on sidebar state */}
      <motion.main
        animate={{ marginLeft: collapsed ? 72 : 248 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:ml-[248px] transition-shadow duration-300"
      >
        <DashboardMotionWrapper>{children}</DashboardMotionWrapper>
      </motion.main>
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
