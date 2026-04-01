import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { FiHeart, FiMessageCircle, FiShare2 } from "react-icons/fi";
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

const getMockMetric = (seed: string, base: number, spread: number): number => {
  const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return base + (hash % spread);
};

export function PortfolioExploreCard({ portfolio }: PortfolioExploreCardProps) {
  const likes = getMockMetric(`${portfolio.slug}-likes`, 24, 120);
  const comments = getMockMetric(`${portfolio.slug}-comments`, 6, 28);
  const shares = getMockMetric(`${portfolio.slug}-shares`, 3, 18);

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#050a72]/12 bg-linear-to-br from-white via-[#fbfcff] to-[#f3f6ff] shadow-lg transition-all hover:-translate-y-1.5 hover:border-[#1420a0]/30 hover:shadow-[0_30px_100px_-40px_rgba(5,10,114,0.16)] dark:border-[#050a72]/28 dark:from-[#070b18]/96 dark:via-[#081022]/94 dark:to-[#04060d]/98 dark:hover:border-[#1420a0]/60 dark:hover:shadow-[0_30px_100px_-40px_rgba(5,10,114,0.42)]">
      {/* Preview area */}
      <div className="relative h-44 overflow-hidden border-b border-[#050a72]/12 dark:border-[#050a72]/24">
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
          <h3 className="truncate text-base font-semibold text-slate-950 dark:text-white">
            {portfolio.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#050a72]/12 text-xs font-bold text-[#050a72] dark:bg-[#050a72]/28 dark:text-[#dfe8ff]">
              {portfolio.ownerName ? getInitials(portfolio.ownerName) : "?"}
            </span>
          )}
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {portfolio.ownerName ?? "Anonymous"}
          </p>
        </div>

        <div className="mb-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-300">
          <div className="inline-flex items-center gap-1.5">
            <FiHeart className="h-3.5 w-3.5 text-[#9fb2ff]" />
            <span>{likes}</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <FiMessageCircle className="h-3.5 w-3.5 text-[#9fb2ff]" />
            <span>{comments}</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <FiShare2 className="h-3.5 w-3.5 text-[#9fb2ff]" />
            <span>{shares}</span>
          </div>
        </div>

        {/* Action */}
        <Link
          href={`/portfolio/${portfolio.slug}`}
          className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-[#1420a0]/18 bg-[#050a72]/8 px-3 py-2 text-xs font-semibold text-[#050a72] transition-colors hover:bg-[#050a72]/12 dark:border-[#1420a0]/42 dark:bg-[#050a72]/22 dark:text-[#dfe8ff] dark:hover:bg-[#050a72]/32"
        >
          View Portfolio
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
