export interface PortfolioCard {
  title: string
  slug: string
  templateId: string | null
  description: string | null
  ownerName: string | null
  ownerAvatarUrl: string | null
  publishedAt: string
  screenshotUrl: string | null
  sourceType: string | null
  externalUrl: string | null
}

export interface PortfolioCardMetrics {
  likes: number
  comments: number
  views: number
}

export interface PageResponse {
  content: PortfolioCard[]
  totalPages: number
  last: boolean
  number: number
}

export type ExploreFilter = "all" | "templated" | "recent"
