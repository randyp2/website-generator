export interface PortfolioItem {
  id: string
  title: string
  status: string
  slug: string | null
  updatedAt: string
  screenshotUrl: string | null
}

export interface PortfolioListApiItem {
  id: string
  title?: string | null
  status?: string | null
  slug?: string | null
  updated_at?: string
  updatedAt?: string
  created_at?: string
  createdAt?: string
  screenshot_url?: string | null
  screenshotUrl?: string | null
}
