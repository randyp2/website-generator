"use client";

import React from "react";

import { StatsSection } from "./components/StatsSection";
import { RecentSection } from "./components/RecentSection";
import { EngagementTrendChart } from "./components/EngagementTrendChart";
import { ActivityMetricsChart } from "./components/ActivityMetricsChart";

const DashboardHome: React.FC = () => {
    return (
        <div className="relative px-4 md:px-6 pb-14 pt-6">
            {/* Content */}
            <div className="relative z-10 pt-2 text-foreground">
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
