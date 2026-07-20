import { Metadata } from "next";
import { BeamWorkflowSection } from "./components/BeamWorkflowSection";
import ClosingSection from "./components/ClosingSection";
import { HeroSection } from "./components/hero";
import { ProcessSection } from "./components/ProcessSection";
import WhatIsPortRNSection from "./components/WhatIsPortRNSection";
import { getPublicSiteUrl } from "@/lib/public-env";

const APP_DESCRIPTION =
    "PortRN turns your resume into a customizable, AI-generated portfolio website. Review your content, refine the design, verify your work, and publish a professional portfolio.";

export const metadata: Metadata = {
    applicationName: "PortRN",
    title: {
        absolute: "PortRN | AI Portfolio Builder",
    },
    description: APP_DESCRIPTION,
    openGraph: {
        title: "PortRN | AI Portfolio Builder",
        description:
            "Turn your resume into a customizable AI-generated portfolio, refine the design, verify your work, and publish it with PortRN.",
        url: "/",
        siteName: "PortRN",
        // images: [{ url: "/og-image.png" }]
    },
    twitter: {
        title: "PortRN | AI Portfolio Builder",
        description:
            "Turn your resume into a customizable AI-generated portfolio, refine the design, verify your work, and publish it with PortRN.",
    },
};

const sections = [
    { key: "process", Component: ProcessSection },
    { key: "beam-workflow", Component: BeamWorkflowSection },
];

const buildWebApplicationJsonLd = (): string =>
    JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "PortRN",
        url: getPublicSiteUrl(),
        description: APP_DESCRIPTION,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
    });

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-100 text-foreground dark:bg-black">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: buildWebApplicationJsonLd() }}
            />
            <div className="overflow-x-hidden">
                <HeroSection />
                <WhatIsPortRNSection />
                {sections.map(({ key, Component }) => (
                    <Component key={key} />
                ))}
            </div>
            <ClosingSection />
        </div>
    );
}
