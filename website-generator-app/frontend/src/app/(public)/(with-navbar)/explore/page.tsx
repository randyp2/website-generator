import { Metadata } from "next";
import { ExplorePageClient } from "./components/ExplorePageClient";

export const metadata: Metadata = {
  title: "Explore Portfolios | AI Portfolio Generator",
  description:
    "Browse portfolio inspiration from freelancers and creators across gig platforms. Search and filter by role, platform, and style.",
  keywords: [
    "explore portfolios",
    "freelancer portfolio examples",
    "gig economy creators",
    "portfolio inspiration",
  ],
  openGraph: {
    title: "Explore Portfolios",
    description:
      "Discover portfolio previews from designers, developers, writers, and more.",
    url: "https://yourdomain.com/explore",
    siteName: "AI Portfolio Generator",
    images: [
      {
        url: "/og-explore.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function ExplorePage() {
  return <ExplorePageClient />;
}
