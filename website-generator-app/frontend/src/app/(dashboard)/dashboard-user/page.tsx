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

      const text: String = await response.text();
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


        {/* Ping test button */}

        <button
          onClick={handleTest}
          className="z-30 bg-sky-800 text-white px-4 py-2 border border-black rounded-md hover:bg-sky-400 transition-shadow font-semibold hover:cursor-pointer">
          PING!
        </button>

        <button
          onClick={handleSecure}
          className="z-30 bg-sky-800 text-white px-4 py-2 border border-black rounded-md hover:bg-sky-400 transition-shadow font-semibold hover:cursor-pointer">
          SECURE
        </button>

      </div>
    </div>
  );
};

export default DashboardHome;
