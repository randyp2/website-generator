import { MockPortfolio } from "../data/mockPortfolios";
import { ExternalLink, Heart, Bookmark, Sparkles } from "lucide-react";

interface PortfolioExploreCardProps {
  portfolio: MockPortfolio;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PortfolioExploreCard({ portfolio }: PortfolioExploreCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#070d18] shadow-[0_30px_80px_-45px_rgba(8,145,178,0.55)] transition-all hover:-translate-y-1.5 hover:border-cyan-300/40 hover:shadow-[0_30px_100px_-40px_rgba(6,182,212,0.6)]">
      <div
        className="relative h-44 border-b border-white/10 p-4"
        style={{
          background: `linear-gradient(140deg, ${portfolio.previewStyle.start}, ${portfolio.previewStyle.end})`,
        }}
      >
        <div className="absolute inset-0 opacity-30">
          {portfolio.previewStyle.pattern === "grid" && (
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
          )}
          {portfolio.previewStyle.pattern === "mesh" && (
            <div
              className="h-full w-full"
              style={{
                background:
                  "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 90% 70%, rgba(255,255,255,0.15), transparent 35%)",
              }}
            />
          )}
          {portfolio.previewStyle.pattern === "noise" && (
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.2) 0.5px, transparent 0.5px)",
                backgroundSize: "8px 8px",
              }}
            />
          )}
        </div>

        <div className="relative flex h-full items-end">
          <div className="w-full rounded-xl border border-white/25 bg-black/25 p-3 backdrop-blur-sm">
            <div className="mb-2 h-2.5 w-2/3 rounded-full bg-white/70" />
            <div className="mb-2 h-2 w-11/12 rounded-full bg-white/45" />
            <div className="h-2 w-5/12 rounded-full bg-white/35" />
          </div>
        </div>

        <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/30 bg-black/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90">
          {portfolio.theme}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">
              {portfolio.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-300">
              {portfolio.description}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-rose-300/25 bg-rose-300/10 px-2 py-1 text-xs text-rose-100">
            <Heart className="h-3.5 w-3.5" />
            {portfolio.likes}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-slate-900"
              style={{ backgroundColor: portfolio.previewStyle.accent }}
            >
              {getInitials(portfolio.uploaderName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-100">
                {portfolio.uploaderName}
              </p>
              <p className="truncate text-xs text-slate-400">
                {portfolio.uploaderRole}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            {portfolio.platform}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-cyan-300/40 bg-cyan-400/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/30"
            aria-label={`Preview ${portfolio.title}`}
          >
            Preview
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-200 transition-colors hover:bg-white/10"
            aria-label={`Save ${portfolio.title}`}
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
