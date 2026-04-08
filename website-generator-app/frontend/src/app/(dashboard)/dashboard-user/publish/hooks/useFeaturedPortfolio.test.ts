// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { Portfolio } from "@/types/portfolio"

import { useFeaturedPortfolio } from "./useFeaturedPortfolio"

const makePortfolio = (id: string): Portfolio =>
  ({
    id,
    title: `Portfolio ${id}`,
    status: "publish",
    template_id: "blank",
    updated_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
  }) as unknown as Portfolio

describe("useFeaturedPortfolio", () => {
  it("returns null when the live list is empty", () => {
    const { result } = renderHook(() => useFeaturedPortfolio([]))

    expect(result.current.featuredPortfolio).toBeNull()
    expect(result.current.featuredPortfolioId).toBeNull()
  })

  it("defaults to the first live portfolio when nothing has been selected", () => {
    const live = [makePortfolio("a"), makePortfolio("b"), makePortfolio("c")]

    const { result } = renderHook(() => useFeaturedPortfolio(live))

    expect(result.current.featuredPortfolioId).toBe("a")
    expect(result.current.featuredPortfolio?.id).toBe("a")
  })

  it("honors a user override when the selected portfolio is still live", () => {
    const live = [makePortfolio("a"), makePortfolio("b"), makePortfolio("c")]

    const { result } = renderHook(() => useFeaturedPortfolio(live))

    act(() => {
      result.current.setFeaturedPortfolioId("c")
    })

    expect(result.current.featuredPortfolioId).toBe("c")
    expect(result.current.featuredPortfolio?.id).toBe("c")
  })

  it("drops the user override and falls back to the first live portfolio when the selection is no longer live", () => {
    const liveInitial = [makePortfolio("a"), makePortfolio("b"), makePortfolio("c")]
    const { result, rerender } = renderHook(
      ({ live }: { live: Portfolio[] }) => useFeaturedPortfolio(live),
      { initialProps: { live: liveInitial } },
    )

    act(() => {
      result.current.setFeaturedPortfolioId("c")
    })
    expect(result.current.featuredPortfolioId).toBe("c")

    // "c" is unpublished/removed from live
    rerender({ live: [makePortfolio("a"), makePortfolio("b")] })

    expect(result.current.featuredPortfolioId).toBe("a")
    expect(result.current.featuredPortfolio?.id).toBe("a")
  })

  it("returns null once the live list becomes empty even if an override was set", () => {
    const { result, rerender } = renderHook(
      ({ live }: { live: Portfolio[] }) => useFeaturedPortfolio(live),
      { initialProps: { live: [makePortfolio("a")] } },
    )

    act(() => {
      result.current.setFeaturedPortfolioId("a")
    })
    expect(result.current.featuredPortfolioId).toBe("a")

    rerender({ live: [] })

    expect(result.current.featuredPortfolioId).toBeNull()
    expect(result.current.featuredPortfolio).toBeNull()
  })

  it("preserves the override when the live list is reordered but still contains it", () => {
    const a = makePortfolio("a")
    const b = makePortfolio("b")

    const { result, rerender } = renderHook(
      ({ live }: { live: Portfolio[] }) => useFeaturedPortfolio(live),
      { initialProps: { live: [a, b] } },
    )

    act(() => {
      result.current.setFeaturedPortfolioId("b")
    })
    expect(result.current.featuredPortfolioId).toBe("b")

    // Order flipped — override must still point to "b"
    rerender({ live: [b, a] })

    expect(result.current.featuredPortfolioId).toBe("b")
    expect(result.current.featuredPortfolio?.id).toBe("b")
  })
})
