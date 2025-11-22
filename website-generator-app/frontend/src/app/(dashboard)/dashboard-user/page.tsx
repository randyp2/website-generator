"use client";

import React from "react";

import { WelcomeSection } from "./components/WelcomeSection";
import { StatsSection } from "./components/StatsSection";
import { ActionSection } from "./components/ActionSection";
import { ContinueSection } from "./components/ContinueSection";
import { RecentSection } from "./components/RecentSection";

const DashboardHome: React.FC = () => {


  return (
    <div className="relative p-10">
      {/* Content */}
      <div className="relative z-10 pt-5 space-y-8">
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
