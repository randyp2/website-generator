"use client";

import { useTheme } from "next-themes";
import * as React from "react";
import { ExploreEmptyState } from "./ExploreEmptyState";
import { ExploreGrid } from "./ExploreGrid";

export interface PortfolioCard {
  title: string;
  slug: string;
  templateId: string | null;
  ownerName: string | null;
  ownerAvatarUrl: string | null;
  publishedAt: string;
}

const MOCK_PORTFOLIOS: PortfolioCard[] = [
  {
    title: "Sienna Hart Creative Direction",
    slug: "sienna-hart-creative-direction",
    templateId: "Editorial",
    ownerName: "Sienna Hart",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    publishedAt: "2026-03-22T12:00:00.000Z",
  },
  {
    title: "Marcus Vale Product Design",
    slug: "marcus-vale-product-design",
    templateId: "Studio",
    ownerName: "Marcus Vale",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    publishedAt: "2026-03-18T12:00:00.000Z",
  },
  {
    title: "Anya Flores Brand Strategy",
    slug: "anya-flores-brand-strategy",
    templateId: "Minimal",
    ownerName: "Anya Flores",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80",
    publishedAt: "2026-03-14T12:00:00.000Z",
  },
  {
    title: "Noah Kim Motion Portfolio",
    slug: "noah-kim-motion-portfolio",
    templateId: "Motion",
    ownerName: "Noah Kim",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80",
    publishedAt: "2026-03-10T12:00:00.000Z",
  },
  {
    title: "Jade Mercer UX Case Studies",
    slug: "jade-mercer-ux-case-studies",
    templateId: "Case Study",
    ownerName: "Jade Mercer",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=256&q=80",
    publishedAt: "2026-03-06T12:00:00.000Z",
  },
  {
    title: "Theo Brooks Visual Systems",
    slug: "theo-brooks-visual-systems",
    templateId: "Grid",
    ownerName: "Theo Brooks",
    ownerAvatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    publishedAt: "2026-03-02T12:00:00.000Z",
  },
];

export function ExplorePageClient() {
  const portfolios = MOCK_PORTFOLIOS;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <main
      className={`relative min-h-screen overflow-hidden px-4 pb-16 pt-20 md:px-8 md:pt-24 ${
        isDark ? "bg-black text-white" : "bg-white text-slate-950"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(70rem_38rem_at_14%_12%,rgba(5,10,114,0.26),transparent_58%),radial-gradient(56rem_34rem_at_88%_18%,rgba(20,32,160,0.18),transparent_52%),linear-gradient(180deg,#000000_0%,#010205_46%,#000000_100%)]"
              : "bg-[radial-gradient(60rem_32rem_at_12%_10%,rgba(5,10,114,0.08),transparent_60%),radial-gradient(54rem_28rem_at_86%_16%,rgba(20,32,160,0.06),transparent_54%),linear-gradient(180deg,#ffffff_0%,#f8faff_46%,#ffffff_100%)]"
          }`}
        />
        <div
          className={`absolute left-[-10%] top-[18%] h-72 w-[42rem] rotate-[-18deg] bg-linear-to-r from-transparent to-transparent blur-3xl ${
            isDark ? "via-[#050a72]/18" : "via-[#050a72]/10"
          }`}
        />
        <div
          className={`absolute right-[-8%] top-[46%] h-64 w-[36rem] rotate-[-20deg] bg-linear-to-r from-transparent to-transparent blur-3xl ${
            isDark ? "via-[#1420a0]/14" : "via-[#1420a0]/08"
          }`}
        />
      </div>

      <div className="relative z-10 mx-auto mb-12 max-w-7xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#8ea1ff]">
            Explore
          </p>
          <h1
            className={`text-4xl font-semibold tracking-tight md:text-6xl ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Browse portfolio directions shaped for the new `aera.ai` brand.
          </h1>
          <p
            className={`mt-5 max-w-2xl text-base leading-7 md:text-lg ${
              isDark ? "text-white/68" : "text-slate-600"
            }`}
          >
            A front-facing gallery of mock portfolio concepts. No backend data,
            no pagination, just a curated set of examples using the same visual
            language as the landing page.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
      {portfolios.length === 0 ? (
        <ExploreEmptyState />
      ) : (
        <ExploreGrid items={portfolios} />
      )}
      </div>
    </main>
  );
}
