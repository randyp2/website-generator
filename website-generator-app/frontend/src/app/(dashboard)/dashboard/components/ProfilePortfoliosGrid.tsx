"use client"

import { motion } from "framer-motion"

import { ExploreCard } from "@/app/(public)/(site)/explore/components/ExploreCard"
import type { PortfolioCard } from "@/app/(public)/(site)/explore/components/explore.types"

interface ProfilePortfoliosGridProps {
  portfolios: PortfolioCard[]
  loading: boolean
}

const ProfilePortfoliosGrid = ({
  portfolios,
  loading,
}: ProfilePortfoliosGridProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto h-10 w-10 rounded-full border-4 border-border border-t-primary"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading portfolios...
          </p>
        </div>
      </div>
    )
  }

  if (portfolios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-foreground">
          No portfolios yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Portfolios created by this user will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {portfolios.map((portfolio) => (
        <ExploreCard key={portfolio.slug} portfolio={portfolio} />
      ))}
    </div>
  )
}

export default ProfilePortfoliosGrid
