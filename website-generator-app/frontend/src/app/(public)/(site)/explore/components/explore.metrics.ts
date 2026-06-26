import type { PortfolioCardMetrics } from "./explore.types"

interface PortfolioEngagementSummary {
  portfolioId: string
  likesCount: number
  commentsCount: number
  viewsCount: number
  viewerHasLiked: boolean
}

export const fetchExplorePortfolioMetrics = async (
  slug: string,
): Promise<PortfolioCardMetrics> => {
  const response = await fetch(
    `/api/public/portfolio/${encodeURIComponent(slug)}/engagement`,
    {
      cache: "no-store",
      credentials: "same-origin",
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to load engagement metrics for ${slug}`)
  }

  const summary = (await response.json()) as PortfolioEngagementSummary

  return {
    portfolioId: summary.portfolioId,
    likes: summary.likesCount,
    comments: summary.commentsCount,
    views: summary.viewsCount,
    viewerHasLiked: summary.viewerHasLiked,
  }
}
