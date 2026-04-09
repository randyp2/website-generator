"use client"

import { useEffect, useMemo, useState } from "react"

import type { PortfolioCard } from "@/app/(public)/(with-navbar)/explore/components/explore.types"
import type { Portfolio } from "@/types/portfolio"

import { PROFILE_TABS } from "../profile/profile.types"
import type { ProfileTab, ApiPortfolio } from "../profile/profile.types"
import { mapApiPortfolioToCard } from "../profile/profile.utils"
import { isDeployedPortfolio } from "../utils/deployedPortfolio"
import ProfilePortfoliosGrid from "./ProfilePortfoliosGrid"
import VerificationTab from "./verification/VerificationTab"

type PortfolioSubTab = "deployed" | "undeployed"

interface ProfileTabsProps {
  userId: string
  username: string
  avatarUrl: string | null
}

const ProfileTabs = ({ userId, username, avatarUrl }: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>("Portfolios")
  const [portfolioSubTab, setPortfolioSubTab] = useState<PortfolioSubTab>("deployed")
  const [rawPortfolios, setRawPortfolios] = useState<ApiPortfolio[]>([])
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

        setRawPortfolios(data.portfolios)
      } catch (err) {
        console.error("Error fetching portfolios:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolios()
  }, [userId, username, avatarUrl])

  const filteredPortfolios = useMemo<PortfolioCard[]>(() => {
    const filtered = rawPortfolios.filter((p) => {
      const deployed = isDeployedPortfolio({ status: p.status ?? "" } as Portfolio)
      return portfolioSubTab === "deployed" ? deployed : !deployed
    })
    return filtered.map((p) => mapApiPortfolioToCard(p, username, avatarUrl))
  }, [rawPortfolios, portfolioSubTab, username, avatarUrl])

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
          <div className="space-y-4">
            {/* Sub-tab bar */}
            <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
              {(["deployed", "undeployed"] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setPortfolioSubTab(sub)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    portfolioSubTab === sub
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sub === "deployed" ? "Deployed" : "Undeployed"}
                </button>
              ))}
            </div>

            <ProfilePortfoliosGrid
              portfolios={filteredPortfolios}
              loading={loading}
            />
          </div>
        ) : activeTab === "Verification" ? (
          <VerificationTab userId={userId} />
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
