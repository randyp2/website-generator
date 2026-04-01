import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/ThemeProvider";



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

// ---- GLOBAL METADATA ----- 
// Generates meta tag when redering this route/layoutwhat doe
export const metadata: Metadata = {

  // metadataBase: new URL('http://localhost:3000'), // Change to our domain name later
  title: {
    default: "Portfolio Generator | Create Professional AI Portfolios",
    template: "%s | Portfolio Generator", // Insert tiitle for each page 
  }, 
  description: 
    "Instantly create stunning, professional portfolios using AI. reate, preview, and deploy with ease.",
  keywords: [
    "AI Portfolio",
    "Website Generator",
    "Next.js",
    "Developer Portfolio",
    "UI/UX Portfolios",
    "AI Website Builder",
  ],
  authors: [{name: "Randy Pahang II", url: "https://randy.dev"}],
  openGraph: {
    type: "website",
    // url: "https://portfoliogenerator.ai", // Domain url
    title: "Portfolio Generator | Create Professional AI Portfolios",
    description: 
      "Build and deploy stunning AI-generated portfolios with one click.",
    siteName: "Website Generator",
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

<script
  type="application/ld+json" // Not executable script tag

  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SiteNavigationElement",
      "name": ["Home", "Pricing", "Contact"],
      "url": [
        // Modify laters
        "https://yourdomain.com/",
        "https://yourdomain.com/pricing",
        "https://yourdomain.com/contact"
      ]
    }),
  }}
/>


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interSans.variable} ${sourceSerif.variable} ${jetBrainsMono.variable} font-sans overflow-x-hidden relative flex flex-col min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
