import { Calendar, Eye, Heart, Share2, User } from "lucide-react";

import type {
  ExplorePortfolioDetail,
  ExplorePortfolioMetrics,
  TimeAgoParts,
} from "../explore-portfolio-detail.types";
import {
  getPortfolioOwnerName,
  getTemplateLabel,
} from "../explore-portfolio-detail.utils";

interface ExplorePortfolioSidebarProps {
  portfolio: ExplorePortfolioDetail;
  metrics: ExplorePortfolioMetrics;
  updatedTime: TimeAgoParts;
}

export const ExplorePortfolioSidebar = ({
  portfolio,
  metrics,
  updatedTime,
}: ExplorePortfolioSidebarProps) => {
  const ownerName = getPortfolioOwnerName(portfolio);
  const templateLabel = getTemplateLabel(portfolio.templateId);
  const sectionCount = portfolio.sections.length;

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
            <div className="flex min-w-0 items-center gap-2">
              <Heart className="size-4 text-muted-foreground" />
              <span>{metrics.likes.toLocaleString()}</span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Eye className="size-4 text-muted-foreground" />
              <span>{metrics.views.toLocaleString()}</span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Share2 className="size-4 text-muted-foreground" />
              <span>{metrics.shares.toLocaleString()}</span>
            </div>
          </div>
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
