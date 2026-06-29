"use client"

import { useCallback, useMemo } from "react"

import type { Portfolio } from "@/types/portfolio"

import {
  usePortfolioListCache,
  usePortfolioListQuery,
} from "../../hooks/usePortfolioListQuery"
import { isDeployedPortfolio, isExternalPortfolio } from "../../utils/deployedPortfolio"
import { compareByUpdatedAtDesc } from "../lib/sortPortfolios"

interface UsePortfoliosListResult {
  portfolios: Portfolio[]
  drafts: Portfolio[]
  live: Portfolio[]
  loading: boolean
  reload: () => Promise<void>
  setPortfolios: React.Dispatch<React.SetStateAction<Portfolio[]>>
}

const normalizePortfolio = (item: Portfolio): Portfolio => ({
  ...item,
  title: item.title ?? "Untitled Portfolio",
})

export const usePortfoliosList = (
  userId: string | null | undefined,
): UsePortfoliosListResult => {
  const {
    data: portfolioRows = [],
    isLoading,
    refetch,
  } = usePortfolioListQuery(userId)
  const { setPortfolios } = usePortfolioListCache(userId)

  const reload = useCallback(async (): Promise<void> => {
    await refetch()
  }, [refetch])

  const portfolios = useMemo<Portfolio[]>(
    () => portfolioRows.map(normalizePortfolio),
    [portfolioRows],
  )

  const drafts = useMemo<Portfolio[]>(
    () =>
      portfolios
        .filter((portfolio) => !isDeployedPortfolio(portfolio) && !isExternalPortfolio(portfolio))
        .sort(compareByUpdatedAtDesc),
    [portfolios],
  )

  const live = useMemo<Portfolio[]>(
    () => portfolios.filter(isDeployedPortfolio).sort(compareByUpdatedAtDesc),
    [portfolios],
  )

  return { portfolios, drafts, live, loading: isLoading, reload, setPortfolios }
}
