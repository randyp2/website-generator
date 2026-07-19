import Link from "next/link";

import { BrowserPreviewFrame } from "@/components/ui/browser-preview-frame";
import { buildPortfolioUrl } from "@/lib/public-env";

import {
  DEFAULT_PREVIEW_IMAGE,
  getPortfolioFullHref,
  isExternalExplorePortfolio,
} from "../explore-portfolio-detail.utils";
import type { ExplorePortfolioDetail } from "../explore-portfolio-detail.types";

interface ExplorePortfolioPreviewCardProps {
  portfolio: ExplorePortfolioDetail;
}

export const ExplorePortfolioPreviewCard = ({
  portfolio,
}: ExplorePortfolioPreviewCardProps) => {
  const isExternal = isExternalExplorePortfolio(portfolio);
  const displayUrl =
    isExternal && portfolio.externalUrl
      ? portfolio.externalUrl
      : buildPortfolioUrl(portfolio.slug, portfolio.ownerName);

  return (
    <Link
      href={getPortfolioFullHref(portfolio)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${portfolio.title} portfolio`}
      className="block cursor-pointer rounded-xl transition-transform duration-200 hover:scale-[1.01] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <BrowserPreviewFrame
        src={portfolio.screenshotUrl ?? DEFAULT_PREVIEW_IMAGE}
        alt={`${portfolio.title} preview`}
        url={displayUrl}
        fallback="https://placehold.co/1200x675?text=Portfolio+Preview"
        contentClassName="-mt-px overflow-hidden"
        imageClassName="-mt-2"
      />
    </Link>
  );
};
