export interface PortfolioCard {
  title: string
  slug: string
  templateId: string | null
  ownerName: string | null
  ownerAvatarUrl: string | null
  publishedAt: string
}

export interface PageResponse {
  content: PortfolioCard[]
  totalPages: number
  last: boolean
  number: number
}

export type ExploreFilter = "all" | "templated" | "recent"
