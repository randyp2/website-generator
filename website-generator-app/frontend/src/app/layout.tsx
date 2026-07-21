import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppThemeProvider } from "@/components/theme/AppThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { EmailConfirmationNotice } from "@/components/auth/EmailConfirmationNotice";
import GenerationJobWatcher from "@/components/GenerationJobWatcher";
import { getPublicSiteUrl } from "@/lib/public-env";
import AppQueryProvider from "@/components/query/AppQueryProvider";



const interSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const resolveMetadataBase = (): URL => {
  try {
    return new URL(getPublicSiteUrl());
  } catch {
    return new URL("http://localhost:3000");
  }
};

// ---- GLOBAL METADATA ----- 
// Generates meta tag when redering this route/layoutwhat doe
export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: "PortRN | Create Professional AI Portfolios",
    template: "%s | PortRN", // Insert title for each page
  },
  description:
    "Instantly create stunning, professional portfolios using AI. Create, preview, and deploy with ease.",
  keywords: [
    "AI Portfolio",
    "Website Generator",
    "Next.js",
    "Developer Portfolio",
    "UI/UX Portfolios",
    "AI Website Builder",
  ],
  authors: [{name: "Randy Pahang II", url: "https://randy.dev"}],
  icons: {
    icon: [{ url: "/branding/portrn-logo.svg", type: "image/svg+xml" }],
    shortcut: ["/branding/portrn-logo.svg"],
    apple: [{ url: "/branding/portrn-logo.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    title: "PortRN | Create Professional AI Portfolios",
    description:
      "Build and deploy stunning AI-generated portfolios with one click.",
    siteName: "PortRN",
    // Company img
    // images: [
    //   {
    //     url: "/og-image.png", 
    //     width: 1200,
    //     height: 630,
    //     alt: "Portfolio Generator Open Graph Image",
    //   }
    // ]
    
  }, 
  robots: {
    index: true,
    follow: true,
  }

};

// Structured data for site navigation. URLs derive from the configured site
// origin (NEXT_PUBLIC_SITE_URL) so they follow the active domain automatically.
const buildSiteNavigationJsonLd = (): string => {
  const siteUrl = getPublicSiteUrl();
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: ["Home", "Pricing", "Contact"],
    url: [`${siteUrl}/`, `${siteUrl}/pricing`, `${siteUrl}/contact`],
  });
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interSans.variable} ${sourceSerif.variable} ${jetBrainsMono.variable} font-sans overflow-x-clip relative flex flex-col min-h-screen bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildSiteNavigationJsonLd() }}
        />
        <AppQueryProvider>
          <AppThemeProvider>
            {children}
            <Suspense fallback={null}>
              <EmailConfirmationNotice />
            </Suspense>
            <Toaster />
            <GenerationJobWatcher />
          </AppThemeProvider>
        </AppQueryProvider>
      </body>
    </html>
  );
}
