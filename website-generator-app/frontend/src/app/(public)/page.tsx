

import { Metadata } from "next";
import { FeatureSection } from "./components/FeatureSection";
import { VisualFeaturesSection } from "./components/VisualFeaturesSection";
import AboutSection from "./components/AboutSection";
import { CTASection } from "./components/CTASection";
import HeroSection from "./components/HeroSection";

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

const sections = [
  { key: "about", Component: AboutSection },
  { key: "features", Component: FeatureSection },
  { key: "visual-features", Component: VisualFeaturesSection },
  { key: "cta", Component: CTASection },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#151d21] text-white">
      <HeroSection />
      {sections.map(({ key, Component }) => (
        <Component key={key} />
      ))}
    </main>
  );
}
