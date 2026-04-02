import { Metadata } from "next";
import { BeamWorkflowSection } from "./components/BeamWorkflowSection";
import ClosingSection from "./components/ClosingSection";
import { HeroSection } from "./components/hero";
import { ProcessSection } from "./components/ProcessSection";

export const metadata: Metadata = {
    title: "AI Portfolio Generator – Build Stunning Portfolios Instantly",
    description:
        "Create a beautiful, professional portfolio website in minutes using AI. No coding required. Customize styles, upload your resume, and instantly deploy your portfolio.",
    openGraph: {
        title: "AI Portfolio Generator – Build Stunning Portfolios Instantly",
        description:
            "Generate AI-crafted portfolio websites in minutes. Fully customizable, responsive, and ready to deploy.",
        url: "https://yourdomain.com/",
        siteName: "PortRN",
        // images: [{ url: "/og-image.png" }]
    },
    twitter: {
        title: "AI Portfolio Generator",
        description:
            "Build professional AI-generated portfolio websites instantly.",
    },
};

const sections = [
    { key: "process", Component: ProcessSection },
    { key: "beam-workflow", Component: BeamWorkflowSection },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-100 text-foreground dark:bg-black">
            <div className="overflow-x-hidden">
                <HeroSection />
                {sections.map(({ key, Component }) => (
                    <Component key={key} />
                ))}
            </div>
            <ClosingSection />
        </div>
    );
}
