"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  loadPortfolioDescriptions,
  savePortfolioDescriptions,
  type PortfolioDescriptionMap,
} from "../lib/portfolioDescriptions"

export const usePortfolioDescriptions = () => {
  const [descriptions, setDescriptions] = useState<PortfolioDescriptionMap>(() =>
    loadPortfolioDescriptions(),
  )
  const hasMounted = useRef(false)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    savePortfolioDescriptions(descriptions)
  }, [descriptions])

  const getDescription = useCallback(
    (portfolioId: string | number | null | undefined): string => {
      if (portfolioId === null || portfolioId === undefined) return ""
      return descriptions[String(portfolioId)] ?? ""
    },
    [descriptions],
  )

  const upsertDescription = useCallback(
    (portfolioId: string, value: string) => {
      const trimmed = value.trim()
      setDescriptions((prev) => {
        const next = { ...prev }
        if (!trimmed) {
          delete next[portfolioId]
        } else {
          next[portfolioId] = trimmed
        }
        return next
      })
    },
    [setDescriptions],
  )

  return {
    descriptions,
    getDescription,
    upsertDescription,
  }
}
