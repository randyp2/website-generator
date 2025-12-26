"use client";

import React, { useEffect } from "react";

import { WelcomeSection } from "./components/WelcomeSection";
import { StatsSection } from "./components/StatsSection";
import { ActionSection } from "./components/ActionSection";
import { ContinueSection } from "./components/ContinueSection";
import { RecentSection } from "./components/RecentSection";
import { createClient } from "@/utils/supabase/client";


const DashboardHome: React.FC = () => {

  // Print out session info | Verify using JWT assymetric RSA signing
  useEffect(() => {
    const supabase = createClient();

    async function load() {

      // Fetch session to verify client-side auth
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("SESSION: ", session);

      if (session) {
        // Decode and log JWT header for debugging
        const token = session.access_token;
        const header = JSON.parse(atob(token.split(".")[0]));

        console.log("JWT HEADER:", header);
        console.log("JWT TOKEN:", token);
      }

    }

    load();
  }, []);


  const handleTest = async () => {
    try {
      const response: Response = await fetch(
        // "http://localhost:8080/api/generate/ping",// Change to when in dev
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate/ping`,
        {
          method: "GET",
        })

      const text: string = await response.text();
      alert("Ping ressponse: " + text);
    } catch (error) {
      console.error("Error during test ping:", error);
    }
  }

  const handleSecure = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        alert("No active session! Please log in.");
        return;
      }

      const token = session.access_token;

      const response = await fetch(
      // "http://localhost:8080/api/generate/secure", // Change to when in dev
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate/secure`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,  // << VERY IMPORTANT
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();
      alert("SECURE endpoint response: " + text);
    } catch (error) {
      console.error("Error during secure request:", error);
    }
  }

  return (
    <div className="relative px-6 md:px-10 pb-16 pt-8">
      {/* Content */}
      <div className="relative z-10 pt-2 text-white">
        <div className="grid grid-cols-1 xl:grid-cols-6 auto-rows-[minmax(120px,auto)] gap-6">
          <div className="xl:col-span-4 space-y-4">
            <WelcomeSection />
            <StatsSection />
            <div className="relative bg-white/5 rounded-2xl p-6 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Engagement Trend</h3>
                  <p className="text-sm text-white/60">Views and exports over time</p>
                </div>
              </div>
              <div className="mt-4 h-48 rounded-xl bg-[#0a0a0a] border border-white/10 relative overflow-hidden">
                <div className="absolute inset-4 grid grid-cols-6 gap-3 items-end">
                  {[20, 35, 28, 42, 38, 50].map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className="w-full rounded-full bg-linear-to-t from-white/10 via-white/20 to-white/60 shadow-[0_10px_25px_rgba(255,255,255,0.18)] transition-all hover:scale-105"
                        style={{ height: `${h * 2}px` }}
                      />
                      <span className="text-[10px] text-white/60">{`W${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <ContinueSection />
          </div>

          <div className="xl:col-span-2 space-y-4">
            <ActionSection />
            <div className="relative bg-white/5 rounded-2xl p-5 border border-white/10 shadow-lg w-full">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">System Utilities</h3>
                <p className="text-sm text-white/60">Diagnostics for API connectivity.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleTest}
                  className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 font-semibold hover:border-white/30 hover:bg-white/15 transition-all text-left"
                >
                  Ping Backend
                </button>
                <button
                  onClick={handleSecure}
                  className="w-full rounded-xl bg-linear-to-r from-[#1b2a44] via-[#12375c] to-[#1b2a44] text-white px-4 py-3 font-semibold shadow-[0_12px_30px_rgba(17,58,106,0.35)] hover:shadow-[0_16px_40px_rgba(17,58,106,0.45)] transition-all text-left"
                >
                  Secure Check
                </button>
              </div>
            </div>
            <div className="relative bg-white/5 rounded-2xl p-5 border border-white/10 shadow-lg w-full">
              <h3 className="text-lg font-semibold mb-2">Resources</h3>
              <p className="text-sm text-white/70 mb-4">
                Quick links to docs and support so you can keep momentum.
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <a className="text-white/80 hover:text-white transition-colors wrap-break-word" href="#">
                  Product guide
                </a>
                <a className="text-white/80 hover:text-white transition-colors wrap-break-word" href="#">
                  Changelog
                </a>
                <a className="text-white/80 hover:text-white transition-colors wrap-break-word" href="#">
                  Contact support
                </a>
              </div>
            </div>
            <div className="relative bg-white/5 rounded-2xl p-5 border border-white/10 shadow-lg w-full">
              <h3 className="text-lg font-semibold mb-2">Activity Stream</h3>
              <div className="space-y-3 text-sm text-white/70 min-h-[400px]">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span className="wrap-break-word">Portfolio “Midnight Studio” exported to production.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/50" />
                  <span className="wrap-break-word">Theme preset “Carbon Fade” saved to library.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" />
                  <span className="wrap-break-word">New collaborator invited to “Studio Noir”.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-6">
            <RecentSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
