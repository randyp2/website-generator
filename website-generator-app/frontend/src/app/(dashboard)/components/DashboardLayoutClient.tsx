"use client";

import React, { useState } from "react";
import SidebarNavigation from "./SidebarNavigation";
import DashboardMotionWrapper from "./DashboardMotionWrapper";
import { motion } from "framer-motion";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

const DashboardLayoutClient: React.FC<DashboardLayoutClientProps> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);

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
        animate={{ marginLeft: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:ml-[280px] transition-shadow duration-300"
      >
        <DashboardMotionWrapper>{children}</DashboardMotionWrapper>
      </motion.main>
    </>
  );
};

export default DashboardLayoutClient;
