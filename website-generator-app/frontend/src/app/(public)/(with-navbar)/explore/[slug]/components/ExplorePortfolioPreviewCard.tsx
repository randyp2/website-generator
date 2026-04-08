import { LazyImage } from "@/components/ui/lazy-image";

import {
  DEFAULT_PREVIEW_IMAGE,
  getPortfolioOwnerName,
} from "../explore-portfolio-detail.utils";
import type { ExplorePortfolioDetail } from "../explore-portfolio-detail.types";

interface ExplorePortfolioPreviewCardProps {
  portfolio: ExplorePortfolioDetail;
}

export const ExplorePortfolioPreviewCard = ({
  portfolio,
}: ExplorePortfolioPreviewCardProps) => {
  const ownerName = getPortfolioOwnerName(portfolio);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b111c]">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <div className="ml-2 min-w-0 flex-1 rounded-full border border-white/15 bg-[#070b14] px-3 py-1">
            <p className="truncate text-xs text-white/75">{`https://portrn/${portfolio.slug}`}</p>
          </div>
        </div>

        <div className="relative">
          <LazyImage
            src={portfolio.screenshotUrl ?? DEFAULT_PREVIEW_IMAGE}
            fallback="https://placehold.co/1200x675?text=Portfolio+Preview"
            inView={true}
            alt={`${portfolio.title} preview`}
            ratio={16 / 9}
            className="object-cover"
            aspectRatioClassName="rounded-none border-0"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <p className="truncate text-base font-semibold text-white sm:text-lg">
              {portfolio.title}
            </p>
            <p className="mt-1 text-sm text-white/75">{ownerName}</p>
          </div>
        </div>
      </div>
    </article>
  );
};
