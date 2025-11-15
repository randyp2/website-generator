"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

import {
  FiPlus,
  FiFolder,
  FiDownload,
  FiGlobe,
  FiTrendingUp,
  FiZap,
  FiClock,
  FiEdit3,
  FiEye,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { WelcomeSection } from "./components/WelcomeSection";
import { StatsSection } from "./components/StatsSection";
import { ActionSection } from "./components/ActionSection";
import { ContinueSection } from "./components/ContinueSection";
import { RecentSection } from "./components/RecentSection";

const DashboardHome: React.FC = () => {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 space-y-8">
        {/* Welcome Section */}
        <WelcomeSection />

        {/* Stats Grid */}
        <StatsSection />

        {/* Continue Where You Left Off Section */}
        <ContinueSection />

        {/* Recent Portfolios Section */}
        <RecentSection />
        
        {/* Quick Actions */}
        <ActionSection />

      </div>
    </div>
  );
};

export default DashboardHome;
