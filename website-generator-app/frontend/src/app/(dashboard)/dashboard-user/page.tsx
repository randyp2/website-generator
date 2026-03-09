"use client";

import React from "react";

import { StatsSection } from "./components/StatsSection";
import { RecentSection } from "./components/RecentSection";
import { EngagementTrendChart } from "./components/EngagementTrendChart";
import { ActivityMetricsChart } from "./components/ActivityMetricsChart";

const DashboardHome: React.FC = () => {
    return (
        <div className="relative px-6 md:px-10 pb-16 pt-8">
            {/* Content */}
            <div className="relative z-10 pt-2 text-white">
                <div className="space-y-6">
                    {/* Top Section: Recent Portfolios */}
                    <RecentSection />

                    {/* Middle Section: Full-width Metrics */}
                    <StatsSection />

                    {/* Bottom Section: Graph Containers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EngagementTrendChart />
                        <ActivityMetricsChart />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
