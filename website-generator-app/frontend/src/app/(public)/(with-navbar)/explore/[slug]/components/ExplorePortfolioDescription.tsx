import { getPortfolioDescription } from "../explore-portfolio-detail.utils";
import type { ExplorePortfolioDetail } from "../explore-portfolio-detail.types";

interface ExplorePortfolioDescriptionProps {
  portfolio: ExplorePortfolioDetail;
}

export const ExplorePortfolioDescription = ({
  portfolio,
}: ExplorePortfolioDescriptionProps) => {
  const descriptionParagraphs = getPortfolioDescription(portfolio);

  return (
    <article className="px-1 py-2 sm:px-2">
      <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
        Mockup Description
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        About This Portfolio
      </h2>
      {descriptionParagraphs.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          {paragraph}
        </p>
      ))}
    </article>
  );
};
