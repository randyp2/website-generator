export interface ApiPortfolio {
  id: string
  title: string
  status?: string
  template_id?: string | null
  slug?: string | null
  description?: string | null
  screenshot_url?: string | null
  created_at?: string | null
  updated_at?: string | null
  source_type?: string | null
  external_url?: string | null
}

export const PROFILE_TABS = [
  "Portfolios",
  "Following",
  "Bookmarked",
] as const

export type ProfileTab = (typeof PROFILE_TABS)[number]

export const PROFILE_MOCK_DATA = {
  bio: "Creative designer and developer passionate about building beautiful digital experiences. Specializing in portfolio design and web development.",
  followers: 2985,
  following: 132,
  likes: 548,
} as const
