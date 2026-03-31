import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { PortfolioCard } from "./ExplorePageClient";

interface PortfolioExploreCardProps {
  portfolio: PortfolioCard;
}

const DEFAULT_CARD_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export function PortfolioExploreCard({ portfolio }: PortfolioExploreCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#070d18] transition-all hover:-translate-y-1.5 hover:border-cyan-300/40 hover:shadow-[0_30px_100px_-40px_rgba(6,182,212,0.6)]">
      {/* Preview area */}
      <div className="relative h-44 overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${DEFAULT_CARD_PREVIEW_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/0" />
        {portfolio.templateId && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/30 bg-black/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90">
            {portfolio.templateId}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="truncate text-base font-semibold text-white">
            {portfolio.title}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {formatDate(portfolio.publishedAt)}
          </p>
        </div>

        {/* Owner */}
        <div className="mb-4 flex items-center gap-2">
          {portfolio.ownerAvatarUrl ? (
            <img
              src={portfolio.ownerAvatarUrl}
              alt={portfolio.ownerName ?? ""}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-bold text-cyan-100">
              {portfolio.ownerName ? getInitials(portfolio.ownerName) : "?"}
            </span>
          )}
          <p className="truncate text-sm font-medium text-slate-100">
            {portfolio.ownerName ?? "Anonymous"}
          </p>
        </div>

        {/* Action */}
        <Link
          href={`/portfolio/${portfolio.slug}`}
          className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-cyan-300/40 bg-cyan-400/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/30"
        >
          View Portfolio
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
