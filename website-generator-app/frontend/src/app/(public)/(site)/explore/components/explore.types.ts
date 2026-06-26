export interface PortfolioCard {
  title: string
  slug: string
  templateId: string | null
  description: string | null
  ownerName: string | null
  ownerUsername: string | null
  ownerAvatarUrl: string | null
  publishedAt: string
  screenshotUrl: string | null
  sourceType: string | null
  externalUrl: string | null
}

export interface PortfolioCardMetrics {
  portfolioId: string
  likes: number
  comments: number
  views: number
  viewerHasLiked: boolean
}

export interface PageResponse {
  content: PortfolioCard[]
  totalPages: number
  last: boolean
  number: number
}

export type ExploreFilter = "all" | "templated" | "recent"
