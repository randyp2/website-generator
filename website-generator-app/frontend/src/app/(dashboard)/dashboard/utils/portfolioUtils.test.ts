import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { Portfolio } from "@/types/portfolio"

import {
  formatRelativeTime,
  getDateValue,
  normalizeStatus,
  resolveResumePath,
} from "./portfolioUtils"

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

describe("normalizeStatus", () => {
  it('maps "archived" to "archived"', () => {
    expect(normalizeStatus("archived")).toBe("archived")
  })

  it('maps "active", "publish", and "published" to "active"', () => {
    expect(normalizeStatus("active")).toBe("active")
    expect(normalizeStatus("publish")).toBe("active")
    expect(normalizeStatus("published")).toBe("active")
  })

  it('maps "draft" to "draft"', () => {
    expect(normalizeStatus("draft")).toBe("draft")
  })

  it('falls back to "draft" for null, undefined, and unknown values', () => {
    expect(normalizeStatus(null)).toBe("draft")
    expect(normalizeStatus(undefined)).toBe("draft")
    expect(normalizeStatus("in_review")).toBe("draft")
    expect(normalizeStatus("")).toBe("draft")
  })

  it("is case-sensitive (does not normalize casing)", () => {
    // Documents current behavior — if the backend ever sends "PUBLISH" it
    // will fall through to "draft" and this test will fail as a reminder.
    expect(normalizeStatus("PUBLISH")).toBe("draft")
  })
})

describe("resolveResumePath", () => {
  const portfolio = makePortfolio({
    id: "11111111-1111-1111-1111-111111111111" as Portfolio["id"],
  })
  const id = portfolio.id

  it('routes "template" to the create entry point without a portfolio id', () => {
    expect(resolveResumePath({ ...portfolio, last_step: "template" })).toBe(
      "/dashboard/create",
    )
  })

  it('routes "style" to the style step with portfolio id', () => {
    expect(resolveResumePath({ ...portfolio, last_step: "style" })).toBe(
      `/dashboard/create/style?portfolioId=${id}`,
    )
  })

  it('routes "upload" (legacy step) to refine', () => {
    expect(resolveResumePath({ ...portfolio, last_step: "upload" })).toBe(
      `/dashboard/create/refine?portfolioId=${id}`,
    )
  })

  it('routes "review" (legacy step) to refine', () => {
    expect(resolveResumePath({ ...portfolio, last_step: "review" })).toBe(
      `/dashboard/create/refine?portfolioId=${id}`,
    )
  })

  it('routes "refine" to the refine step with portfolio id', () => {
    expect(resolveResumePath({ ...portfolio, last_step: "refine" })).toBe(
      `/dashboard/create/refine?portfolioId=${id}`,
    )
  })

  it("defaults to the refine step when last_step is missing", () => {
    expect(resolveResumePath({ ...portfolio, last_step: null })).toBe(
      `/dashboard/create/refine?portfolioId=${id}`,
    )
    const { last_step: _omit, ...withoutStep } = portfolio
    void _omit
    expect(resolveResumePath(withoutStep as Portfolio)).toBe(
      `/dashboard/create/refine?portfolioId=${id}`,
    )
  })

  it("falls through to refine for unknown steps", () => {
    expect(
      resolveResumePath({ ...portfolio, last_step: "mystery-step" }),
    ).toBe(`/dashboard/create/refine?portfolioId=${id}`)
  })
})

describe("formatRelativeTime", () => {
  const NOW = new Date("2026-04-08T12:00:00Z")

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Just now" for null or undefined', () => {
    expect(formatRelativeTime(null)).toBe("Just now")
    expect(formatRelativeTime(undefined)).toBe("Just now")
  })

  it('returns "1m ago" for sub-minute differences (clamped to min 1m)', () => {
    const thirtySecondsAgo = new Date(NOW.getTime() - 30_000).toISOString()
    expect(formatRelativeTime(thirtySecondsAgo)).toBe("1m ago")
  })

  it("returns minutes for sub-hour differences", () => {
    const fiveMinAgo = new Date(NOW.getTime() - 5 * 60_000).toISOString()
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago")
  })

  it("returns hours for sub-day differences", () => {
    const twoHoursAgo = new Date(NOW.getTime() - 2 * 3600_000).toISOString()
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago")
  })

  it("returns days for sub-week differences", () => {
    const threeDaysAgo = new Date(
      NOW.getTime() - 3 * 24 * 3600_000,
    ).toISOString()
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago")
  })

  it("returns a locale date string for differences of a week or more", () => {
    const tenDaysAgo = new Date(NOW.getTime() - 10 * 24 * 3600_000)
    const result = formatRelativeTime(tenDaysAgo.toISOString())
    expect(result).toBe(tenDaysAgo.toLocaleDateString())
    expect(result).not.toMatch(/ago$/)
  })

  it("accepts Date instances as well as ISO strings", () => {
    const fiveMinAgo = new Date(NOW.getTime() - 5 * 60_000)
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago")
  })
})

describe("getDateValue", () => {
  it("returns 0 for null and undefined", () => {
    expect(getDateValue(null)).toBe(0)
    expect(getDateValue(undefined)).toBe(0)
  })

  it("returns the millisecond timestamp for a valid ISO string", () => {
    const iso = "2026-01-01T00:00:00Z"
    expect(getDateValue(iso)).toBe(new Date(iso).getTime())
  })

  it("returns the millisecond timestamp for a Date instance", () => {
    const date = new Date("2026-06-15T10:30:00Z")
    expect(getDateValue(date)).toBe(date.getTime())
  })

  it("returns 0 for an invalid date string", () => {
    expect(getDateValue("not-a-date")).toBe(0)
  })
})
