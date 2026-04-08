import { describe, expect, it } from "vitest"

import type { Portfolio } from "@/types/portfolio"

import { compareByUpdatedAtDesc } from "./sortPortfolios"

const makePortfolio = (overrides: Partial<Portfolio> = {}): Portfolio =>
  ({
    id: "00000000-0000-0000-0000-000000000000",
    title: "Untitled",
    status: "draft",
    template_id: "blank",
    updated_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  }) as Portfolio

describe("compareByUpdatedAtDesc", () => {
  it("sorts portfolios by updated_at in descending order", () => {
    const older = makePortfolio({ updated_at: "2026-01-01T00:00:00Z" })
    const newer = makePortfolio({ updated_at: "2026-03-01T00:00:00Z" })
    const middle = makePortfolio({ updated_at: "2026-02-01T00:00:00Z" })

    const sorted = [older, newer, middle].sort(compareByUpdatedAtDesc)

    expect(sorted).toEqual([newer, middle, older])
  })

  it("falls back to created_at when updated_at is missing", () => {
    const withOnlyCreated = makePortfolio({
      updated_at: null as unknown as string,
      created_at: "2026-05-01T00:00:00Z",
    })
    const withUpdated = makePortfolio({
      updated_at: "2026-04-01T00:00:00Z",
      created_at: "2020-01-01T00:00:00Z",
    })

    const sorted = [withUpdated, withOnlyCreated].sort(compareByUpdatedAtDesc)

    expect(sorted[0]).toBe(withOnlyCreated)
    expect(sorted[1]).toBe(withUpdated)
  })

  it("treats missing timestamps as the oldest (pushed to the end)", () => {
    const withDate = makePortfolio({ updated_at: "2026-01-01T00:00:00Z" })
    const withoutDates = makePortfolio({
      updated_at: null as unknown as string,
      created_at: null as unknown as string,
    })

    const sorted = [withoutDates, withDate].sort(compareByUpdatedAtDesc)

    expect(sorted[0]).toBe(withDate)
    expect(sorted[1]).toBe(withoutDates)
  })

  it("treats invalid date strings as the oldest instead of producing NaN order", () => {
    const valid = makePortfolio({ updated_at: "2026-01-01T00:00:00Z" })
    const invalid = makePortfolio({ updated_at: "not-a-date" })

    const sorted = [invalid, valid].sort(compareByUpdatedAtDesc)

    expect(sorted[0]).toBe(valid)
    expect(sorted[1]).toBe(invalid)
  })

  it("returns 0 for two portfolios with identical updated_at", () => {
    const a = makePortfolio({ updated_at: "2026-01-01T00:00:00Z" })
    const b = makePortfolio({ updated_at: "2026-01-01T00:00:00Z" })

    expect(compareByUpdatedAtDesc(a, b)).toBe(0)
  })

  it("prefers updated_at over created_at when both exist", () => {
    const a = makePortfolio({
      updated_at: "2026-06-01T00:00:00Z",
      created_at: "2020-01-01T00:00:00Z",
    })
    const b = makePortfolio({
      updated_at: "2026-05-01T00:00:00Z",
      created_at: "2026-12-01T00:00:00Z",
    })

    const sorted = [b, a].sort(compareByUpdatedAtDesc)

    expect(sorted[0]).toBe(a)
    expect(sorted[1]).toBe(b)
  })
})
