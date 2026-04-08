"use client"

import { useCallback, useMemo, useState } from "react"

import type { Portfolio } from "@/types/portfolio"

interface UseFeaturedPortfolioResult {
  featuredPortfolio: Portfolio | null
  featuredPortfolioId: string | null
  setFeaturedPortfolioId: (id: string | null) => void
}

/**
 * Derives the featured portfolio from the live list. The user can override
 * the default (first live portfolio) by clicking a card; the override is
 * automatically dropped if the selected portfolio is no longer live.
 */
export const useFeaturedPortfolio = (
  live: Portfolio[],
): UseFeaturedPortfolioResult => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const featuredPortfolioId = useMemo<string | null>(() => {
    if (live.length === 0) return null
    if (selectedId && live.some((p) => String(p.id) === selectedId)) {
      return selectedId
    }
    return String(live[0].id)
  }, [live, selectedId])

  const featuredPortfolio = useMemo<Portfolio | null>(
    () => live.find((p) => String(p.id) === featuredPortfolioId) ?? null,
    [live, featuredPortfolioId],
  )

  const setFeaturedPortfolioId = useCallback((id: string | null): void => {
    setSelectedId(id)
  }, [])

  return { featuredPortfolio, featuredPortfolioId, setFeaturedPortfolioId }
}
