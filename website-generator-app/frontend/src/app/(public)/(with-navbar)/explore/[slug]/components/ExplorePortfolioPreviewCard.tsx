import { BrowserPreviewFrame } from "@/components/ui/browser-preview-frame";
import { buildPortfolioUrl } from "@/lib/public-env";

import {
  DEFAULT_PREVIEW_IMAGE,
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
      : buildPortfolioUrl(portfolio.slug);

  return (
    <article>
      <BrowserPreviewFrame
        src={portfolio.screenshotUrl ?? DEFAULT_PREVIEW_IMAGE}
        alt={`${portfolio.title} preview`}
        url={displayUrl}
        fallback="https://placehold.co/1200x675?text=Portfolio+Preview"
      />
    </article>
  );
};
