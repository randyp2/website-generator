import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, SquareArrowOutUpRight } from "lucide-react";

import { fetchPublicPortfolio } from "@/lib/api/publicPortfolio";
import { ExplorePortfolioDescription } from "./components/ExplorePortfolioDescription";
import { ExplorePortfolioPlaceholderCard } from "./components/ExplorePortfolioPlaceholderCard";
import { ExplorePortfolioPreviewCard } from "./components/ExplorePortfolioPreviewCard";
import { ExplorePortfolioSidebar } from "./components/ExplorePortfolioSidebar";
import PortfolioComments from "./components/PortfolioComments";
import { UnpublishButton } from "./components/UnpublishButton";
import {
  getPortfolioDescriptionSnippet,
  formatTimeAgo,
  getPortfolioFullHref,
  splitTimeAgo,
} from "./explore-portfolio-detail.utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const portfolio = await fetchPublicPortfolio(slug);

  if (!portfolio) {
    return { title: "Portfolio Preview Not Found" };
  }

  return {
    title: `${portfolio.title} | Explore`,
    description: getPortfolioDescriptionSnippet(portfolio, 160),
  };
};

const ExplorePortfolioDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  const portfolio = await fetchPublicPortfolio(slug);

  if (!portfolio) {
    notFound();
  }

  const updatedAgo = formatTimeAgo(portfolio.publishedAt);
  const updatedTime = splitTimeAgo(updatedAgo);
  const heroSummary = getPortfolioDescriptionSnippet(portfolio, 280);

  return (
    <section className="min-h-screen bg-background px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[96rem]">
        <div className="grid items-start gap-x-6 gap-y-8 lg:grid-cols-[minmax(0,1.8fr)_320px]">
          <div className="flex min-w-0 flex-col gap-8">
            <div className="space-y-2">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to Explore
              </Link>
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                  Portfolio Preview
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {portfolio.title}
                </h1>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <p className="max-w-[56rem] flex-1 text-sm leading-6 text-muted-foreground sm:text-base">
                    {heroSummary}
                  </p>
                  <div className="flex shrink-0 items-center gap-3 self-start lg:self-auto">
                    <Link
                      href={getPortfolioFullHref(portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      <SquareArrowOutUpRight className="size-4" />
                      Open Full Portfolio
                    </Link>
                    <UnpublishButton
                      portfolioId={portfolio.portfolioId}
                      userId={portfolio.userId}
                    />
                  </div>
                </div>
              </div>
            </div>

            <ExplorePortfolioPreviewCard portfolio={portfolio} />
          </div>

          <ExplorePortfolioSidebar
            portfolio={portfolio}
            updatedTime={updatedTime}
          />

          <div className="flex min-w-0 flex-col gap-8">
            <ExplorePortfolioDescription portfolio={portfolio} />
            <PortfolioComments
              portfolioId={portfolio.portfolioId}
              portfolioOwnerId={portfolio.userId}
              slug={portfolio.slug}
            />
          </div>

          <ExplorePortfolioPlaceholderCard username={portfolio.ownerUsername} />
        </div>
      </div>
    </section>
  );
};

export default ExplorePortfolioDetailPage;
