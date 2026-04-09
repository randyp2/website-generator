"use client"

import { useEffect, useState } from "react"

import type { PortfolioCard } from "@/app/(public)/(with-navbar)/explore/components/explore.types"

import { PROFILE_TABS } from "../profile/profile.types"
import type { ProfileTab, ApiPortfolio } from "../profile/profile.types"
import { mapApiPortfolioToCard } from "../profile/profile.utils"
import ProfilePortfoliosGrid from "./ProfilePortfoliosGrid"

interface ProfileTabsProps {
  userId: string
  username: string
  avatarUrl: string | null
}

const ProfileTabs = ({ userId, username, avatarUrl }: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>("Portfolios")
  const [portfolios, setPortfolios] = useState<PortfolioCard[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchPortfolios = async () => {
      try {
        setLoading(true)

        const response = await fetch(`/api/portfolio/list?userId=${userId}`, {
          method: "GET",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: { portfolios: ApiPortfolio[] } = await response.json()

        const cards = data.portfolios.map((p) =>
          mapApiPortfolioToCard(p, username, avatarUrl),
        )

        setPortfolios(cards)
      } catch (err) {
        console.error("Error fetching portfolios:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolios()
  }, [userId, username, avatarUrl])

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-6 border-b border-border">
        {PROFILE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors hover:cursor-pointer ${
              activeTab === tab
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "Portfolios" ? (
          <ProfilePortfoliosGrid
            portfolios={portfolios}
            loading={loading}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg font-medium text-foreground">{activeTab}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileTabs
