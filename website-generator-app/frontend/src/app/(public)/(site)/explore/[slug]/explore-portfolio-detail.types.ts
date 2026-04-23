import type { PublicPortfolioDTO } from "@/types/public-portfolio";

export type ExplorePortfolioDetail = PublicPortfolioDTO;

export interface ExplorePortfolioMetrics {
  likes: number;
  shares: number;
  views: number;
}

export interface TimeAgoParts {
  metric: string;
  suffix: string;
}
