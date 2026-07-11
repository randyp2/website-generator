"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Eye, Heart, Share2, User } from "lucide-react";

import {
  createEmptyPortfolioEngagementSummary,
  usePortfolioEngagementQuery,
  useRecordPortfolioShareMutation,
  useRecordPortfolioViewMutation,
  useTogglePortfolioLikeMutation,
} from "../../explore.query";
import type {
  ExplorePortfolioDetail,
  TimeAgoParts,
} from "../explore-portfolio-detail.types";
import {
  getPortfolioOwnerName,
} from "../explore-portfolio-detail.utils";
import { usePublicAuthGate } from "@/context/PublicAuthGateContext";
import { ExplorePortfolioPlaceholderCard } from "./ExplorePortfolioPlaceholderCard";
import { cn } from "@/lib/utils";

interface ExplorePortfolioSidebarProps {
  portfolio: ExplorePortfolioDetail;
  updatedTime: TimeAgoParts;
}

export const ExplorePortfolioSidebar = ({
  portfolio,
  updatedTime,
}: ExplorePortfolioSidebarProps) => {
  const { requireAuth } = usePublicAuthGate();
  const [isSharing, setIsSharing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const engagementQuery = usePortfolioEngagementQuery(portfolio.slug);
  const toggleLikeMutation = useTogglePortfolioLikeMutation();
  const {
    isPending: isRecordingView,
    mutate: recordPortfolioView,
  } = useRecordPortfolioViewMutation();
  const recordShareMutation = useRecordPortfolioShareMutation();

  const ownerName = getPortfolioOwnerName(portfolio);
  const ownerUsername = portfolio.ownerUsername?.replace(/^@/, "") || null;
  const metrics =
    engagementQuery.data ??
    createEmptyPortfolioEngagementSummary(portfolio.portfolioId);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  useEffect(() => {
    if (!engagementQuery.isSuccess || isRecordingView) return;

    const viewStorageKey = `explore:portfolio-viewed:${portfolio.slug}`;
    if (window.sessionStorage.getItem(viewStorageKey)) return;

    window.sessionStorage.setItem(viewStorageKey, "1");
    recordPortfolioView(portfolio.slug, {
      onError: (error) => {
        console.error("Failed to record portfolio view:", error);
        window.sessionStorage.removeItem(viewStorageKey);
      },
    });
  }, [engagementQuery.isSuccess, isRecordingView, portfolio.slug, recordPortfolioView]);

  const handleLike = async () => {
    if (!requireAuth("engagement") || toggleLikeMutation.isPending) return;

    setActionError(null);
    toggleLikeMutation.mutate(
      {
        slug: portfolio.slug,
        portfolioId: portfolio.portfolioId,
        viewerHasLiked: metrics.viewerHasLiked,
      },
      {
        onError: (error) => {
          console.error("Failed to toggle portfolio like:", error);
          setActionError("Could not update like.");
        },
      },
    );
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

      await recordShareMutation.mutateAsync(portfolio.slug);
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
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {ownerName}
                  </span>
                  {ownerUsername && (
                    <Link
                      href={`/${ownerUsername}`}
                      className="block truncate text-sm font-medium text-primary transition-colors hover:cursor-pointer hover:text-primary/80"
                    >
                      @{ownerUsername}
                    </Link>
                  )}
                </span>
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
              disabled={toggleLikeMutation.isPending}
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

        <ExplorePortfolioPlaceholderCard
          profileId={portfolio.userId}
          username={portfolio.ownerUsername}
        />
      </div>
    </aside>
  );
};
