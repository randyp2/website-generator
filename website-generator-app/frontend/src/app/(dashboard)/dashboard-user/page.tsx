"use client";

import React, { useEffect } from "react";

import { StatsSection } from "./components/StatsSection";
import { RecentSection } from "./components/RecentSection";
import { EngagementTrendChart } from "./components/EngagementTrendChart";
import { ActivityMetricsChart } from "./components/ActivityMetricsChart";
import { createClient } from "@/utils/supabase/client";

const DashboardHome: React.FC = () => {
    // Print out session info | Verify using JWT assymetric RSA signing
    // useEffect(() => {
    //   const supabase = createClient();
    //
    //   async function load() {
    //
    //     // Fetch session to verify client-side auth
    //     const {
    //       data: { session },
    //     } = await supabase.auth.getSession();
    //
    //     console.log("SESSION: ", session);
    //
    //     if (session) {
    //       // Decode and log JWT header for debugging
    //       const token = session.access_token;
    //       const header = JSON.parse(atob(token.split(".")[0]));
    //
    //       console.log("JWT HEADER:", header);
    //       console.log("JWT TOKEN:", token);
    //     }
    //
    //   }
    //
    //   load();
    // }, []);

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
