import React from "react";

import HeroSection from "./components/HeroSection";
import StatsSection from "./components/StatsSection";
import FeatureSection from "./components/FeatureSection";
import ProcessSection from "./components/ProcessSection";
import MissionSection from "./components/MissionSection";
import { CTASection } from "../components/CTASection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | AI Portfolio Generator",
  description:
    "Learn how our AI-powered portfolio builder transforms resumes into professional, unique websites in minutes.",
  keywords: [
    "portfolio generator",
    "AI resume to website",
    "AI portfolio builder",
    "developer portfolio",
  ],
  openGraph: {
    title: "About AI Portfolio Generator",
    description:
      "Discover how our AI converts your resume into a full website in seconds.",
    url: "https://yourdomain.com/about",
    siteName: "AI Portfolio Generator",
    images: [
      {
        url: "/og-about.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const AboutPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-background pt-20 text-foreground">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeatureSection />

      {/* Process Section */}
      <ProcessSection />

      {/* Mission Section */}
      <MissionSection />

      {/* CTA Section */}
      <CTASection />
    </main>
  );
};

export default AboutPage;
