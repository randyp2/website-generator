import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
    // Shared SEO defaults for all public pages
    title: {
        default: "PortRN – AI Portfolio Generator",
        template: "%s | PortRN",
    },
    description:
        "PortRN helps you instantly create professional, AI-designed portfolio websites. Build, customize, and deploy in minutes.",
    keywords: [
        "AI Portfolio Generator",
        "Portfolio Builder",
        "Website Generator",
        "AI Website Builder",
        "Developer Portfolio",
        "Designer Portfolio",
        "Next.js Portfolio Tool",
    ],

    openGraph: {
        type: "website",
        siteName: "PortRN",
        title: "PortRN – AI Portfolio Generator",
        description:
            "Generate beautiful AI-crafted portfolio websites in minutes without coding.",
        // You can add og:image if you have one:
        // images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },

    twitter: {
        card: "summary_large_image",
        title: "PortRN – AI Portfolio Generator",
        description: "Create stunning AI-powered portfolio websites instantly.",
    },

    robots: {
        index: true,
        follow: true,
    },
};

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Shared public navigation */}
            <Navbar />

            {/* Page content */}
            <main className="flex-1">{children}</main>

            {/* Shared public footer */}
            <Footer />
        </>
    );
}
