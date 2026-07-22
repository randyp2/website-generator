"use client"

import { useCallback } from "react"

import type { Portfolio } from "@/types/portfolio"

type SetPortfolios = React.Dispatch<React.SetStateAction<Portfolio[]>>

interface PublishedPatch {
  portfolioId: string
  slug: string
  description: string
  screenshotUrl: string | null
}

interface UsePublishMutationsArgs {
  setPortfolios: SetPortfolios
}

interface UsePublishMutationsResult {
  applyPublished: (patch: PublishedPatch) => void
  unpublish: (portfolioId: string) => Promise<void>
  updateDescription: (portfolioId: string, description: string) => Promise<void>
}

const updatePortfolioById = (
  portfolios: Portfolio[],
  portfolioId: string,
  patch: Partial<Portfolio>,
): Portfolio[] =>
  portfolios.map((portfolio) =>
    String(portfolio.id) === portfolioId ? { ...portfolio, ...patch } : portfolio,
  )

export const usePublishMutations = ({
  setPortfolios,
}: UsePublishMutationsArgs): UsePublishMutationsResult => {
  const applyPublished = useCallback(
    ({ portfolioId, slug, description, screenshotUrl }: PublishedPatch): void => {
      setPortfolios((prev) =>
        updatePortfolioById(prev, portfolioId, {
          status: "publish",
          slug,
          description: description.trim() || null,
          screenshot_url: screenshotUrl,
          updated_at: new Date().toISOString(),
        }),
      )
    },
    [setPortfolios],
  )

  const unpublish = useCallback(
    async (portfolioId: string): Promise<void> => {
      try {
        const res = await fetch(`/api/portfolio/${portfolioId}/unpublish`, {
          method: "POST",
        })
        if (!res.ok) throw new Error("Failed to unpublish")
        setPortfolios((prev) =>
          updatePortfolioById(prev, portfolioId, {
            status: "draft",
            slug: null,
            screenshot_url: null,
            updated_at: new Date().toISOString(),
          }),
        )
      } catch (error) {
        console.error("Failed to unpublish", error)
      }
    },
    [setPortfolios],
  )

  const updateDescription = useCallback(
    async (portfolioId: string, description: string): Promise<void> => {
      const res = await fetch(`/api/portfolio/${portfolioId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(data?.error ?? "Failed to save description")
      }

      const normalized = description.trim() || null
      setPortfolios((prev) =>
        updatePortfolioById(prev, portfolioId, { description: normalized }),
      )
    },
    [setPortfolios],
  )

  return { applyPublished, unpublish, updateDescription }
}
