"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type { Portfolio } from "@/types/portfolio"

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
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const reload = useCallback(async (): Promise<void> => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/portfolio/list?userId=${userId}`)
      if (!res.ok) throw new Error("Failed to fetch portfolios")
      const data: unknown = await res.json()
      const rawRows = (data as { portfolios?: unknown })?.portfolios
      const rows: Portfolio[] = Array.isArray(rawRows)
        ? (rawRows as Portfolio[]).map(normalizePortfolio)
        : []
      setPortfolios(rows)
    } catch (error) {
      console.error("Failed to fetch portfolios", error)
      setPortfolios([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void reload()
  }, [reload])

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

  return { portfolios, drafts, live, loading, reload, setPortfolios }
}
