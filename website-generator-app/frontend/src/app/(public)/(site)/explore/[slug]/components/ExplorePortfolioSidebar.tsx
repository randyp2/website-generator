"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Eye, Heart, Share2, User } from "lucide-react";

import type {
  ExplorePortfolioDetail,
  TimeAgoParts,
} from "../explore-portfolio-detail.types";
import {
  getPortfolioOwnerName,
  getTemplateLabel,
} from "../explore-portfolio-detail.utils";
import {
  fetchPortfolioEngagementSummary,
  likePortfolio,
  recordPortfolioShare,
  recordPortfolioView,
  unlikePortfolio,
} from "../portfolio-engagement.api";
import type { PortfolioEngagementSummary } from "../portfolio-engagement.types";
import { usePublicAuthGate } from "@/context/PublicAuthGateContext";
import { cn } from "@/lib/utils";

interface ExplorePortfolioSidebarProps {
  portfolio: ExplorePortfolioDetail;
  updatedTime: TimeAgoParts;
}

const emptySummary = (portfolioId: string): PortfolioEngagementSummary => ({
  portfolioId,
  likesCount: 0,
  commentsCount: 0,
  viewsCount: 0,
  sharesCount: 0,
  viewerHasLiked: false,
});

export const ExplorePortfolioSidebar = ({
  portfolio,
  updatedTime,
}: ExplorePortfolioSidebarProps) => {
  const { requireAuth } = usePublicAuthGate();
  const [summary, setSummary] = useState<PortfolioEngagementSummary | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const ownerName = portfolio.ownerUsername ?? getPortfolioOwnerName(portfolio);
  const templateLabel = getTemplateLabel(portfolio.templateId);
  const sectionCount = portfolio.sections.length;
  const metrics = summary ?? emptySummary(portfolio.portfolioId);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadEngagement = async () => {
      try {
        const nextSummary = await fetchPortfolioEngagementSummary(portfolio.slug);
        if (!isMounted) return;
        setSummary(nextSummary);

        const viewStorageKey = `explore:portfolio-viewed:${portfolio.slug}`;
        if (window.sessionStorage.getItem(viewStorageKey)) return;

        window.sessionStorage.setItem(viewStorageKey, "1");
        const viewedSummary = await recordPortfolioView(portfolio.slug);
        if (isMounted) {
          setSummary(viewedSummary);
        }
      } catch (error) {
        console.error("Failed to load portfolio engagement:", error);
      }
    };

    void loadEngagement();

    return () => {
      isMounted = false;
    };
  }, [portfolio.slug]);

  const handleLike = async () => {
    if (!requireAuth("engagement") || isLiking) return;

    const previousSummary = metrics;
    const optimisticSummary: PortfolioEngagementSummary = {
      ...previousSummary,
      likesCount: previousSummary.viewerHasLiked
        ? Math.max(0, previousSummary.likesCount - 1)
        : previousSummary.likesCount + 1,
      viewerHasLiked: !previousSummary.viewerHasLiked,
    };

    setActionError(null);
    setSummary(optimisticSummary);
    setIsLiking(true);

    try {
      const nextSummary = previousSummary.viewerHasLiked
        ? await unlikePortfolio(portfolio.portfolioId)
        : await likePortfolio(portfolio.portfolioId);
      setSummary(nextSummary);
    } catch (error) {
      console.error("Failed to toggle portfolio like:", error);
      setSummary(previousSummary);
      setActionError("Could not update like.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;

    setActionError(null);
    setIsSharing(true);

    try {
      const url = shareUrl || window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: portfolio.title,
          text: `View ${portfolio.title} on Explore.`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }

      const nextSummary = await recordPortfolioShare(portfolio.slug);
      setSummary(nextSummary);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error("Failed to share portfolio:", error);
      setActionError("Could not share portfolio.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <aside className="lg:self-stretch">
      <div className="flex flex-col gap-5 lg:sticky lg:top-24">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
            Portfolio Details
          </p>
          <dl className="mt-5 space-y-4">
            <div>
              <dd className="mt-2 flex w-full items-center gap-3">
                {portfolio.ownerAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={portfolio.ownerAvatarUrl}
                    alt={ownerName}
                    className="size-10 rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <User className="size-5 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground">{ownerName}</span>
              </dd>
            </div>
            <div>
              <dd className="mt-1 flex w-full items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="size-4 text-muted-foreground" />
                <span>
                  Updated <span className="text-primary">{updatedTime.metric}</span>
                  {updatedTime.suffix}
                </span>
              </dd>
            </div>
          </dl>
          <div className="mt-4 h-px w-full bg-border" />
          <div className="mt-4 flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground">
            <button
              type="button"
              onClick={handleLike}
              disabled={isLiking}
              aria-pressed={metrics.viewerHasLiked}
              className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:cursor-pointer hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Heart
                className={cn(
                  "size-4 text-muted-foreground transition-colors",
                  metrics.viewerHasLiked && "fill-primary text-primary",
                )}
              />
              <span>{metrics.likesCount.toLocaleString()}</span>
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <Eye className="size-4 text-muted-foreground" />
              <span>{metrics.viewsCount.toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:cursor-pointer hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Share2 className="size-4 text-muted-foreground" />
              <span>{metrics.sharesCount.toLocaleString()}</span>
            </button>
          </div>
          {actionError && (
            <p className="mt-3 text-xs text-destructive">{actionError}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
            Portfolio Snapshot
          </p>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Template</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{templateLabel}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Sections</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {sectionCount} section{sectionCount === 1 ? "" : "s"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Slug</dt>
              <dd className="mt-1 break-all text-sm font-medium text-foreground">
                {portfolio.slug}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              Summary
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              This right-side area keeps the core portfolio metadata visible while the preview
              image and description expand across the left side of the page.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
