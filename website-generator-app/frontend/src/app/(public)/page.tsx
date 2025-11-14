

import { HeroSection } from "./components/HeroSection";
import { FeatureSection } from "./components/FeatureSection";
import { ExampleSection } from "./components/ExampleSection";
import { CTASection } from "./components/CTASection";
import { Metadata } from "next";
import AboutSection from "./components/AboutSection";

export const metadata: Metadata = {
  title: "AI Portfolio Generator – Build Stunning Portfolios Instantly",
  description:
    "Create a beautiful, professional portfolio website in minutes using AI. No coding required. Customize styles, upload your resume, and instantly deploy your portfolio.",
  openGraph: {
    title: "AI Portfolio Generator – Build Stunning Portfolios Instantly",
    description:
      "Generate AI-crafted portfolio websites in minutes. Fully customizable, responsive, and ready to deploy.",
    url: "https://yourdomain.com/",
    siteName: "PortfolioAI",
    // images: [{ url: "/og-image.png" }]
  },
  twitter: {
    title: "AI Portfolio Generator",
    description:
      "Build professional AI-generated portfolio websites instantly.",
  }
};

export default function LandingPage() {


  return (
    <main className="min-h-screen pt-20">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeatureSection />

      {/* Examples Preview Section */}
      <ExampleSection />

      {/* About Section */}
      <AboutSection />

      {/* Final CTA Section */}
      <CTASection />

      {/* Footer */}
      
    </main>
  );
};