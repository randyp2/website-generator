import { describe, expect, it } from "vitest"

import type { Portfolio } from "@/types/portfolio"

import {
  formatFieldValue,
  formatPortfolioDate,
  getFirstDeployedPortfolio,
  isDeployedPortfolio,
  isExternalPortfolio,
} from "./deployedPortfolio"

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

describe("isDeployedPortfolio", () => {
  it.each(["active", "publish", "published"])(
    'returns true for status "%s"',
    (status) => {
      expect(isDeployedPortfolio(makePortfolio({ status }))).toBe(true)
    },
  )

  it("normalizes casing when checking status", () => {
    expect(isDeployedPortfolio(makePortfolio({ status: "PUBLISH" }))).toBe(true)
    expect(isDeployedPortfolio(makePortfolio({ status: "Active" }))).toBe(true)
  })

  it("trims whitespace before checking status", () => {
    expect(isDeployedPortfolio(makePortfolio({ status: "  publish  " }))).toBe(
      true,
    )
  })

  it.each(["draft", "archived", "in_review", ""])(
    'returns false for non-deployed status "%s"',
    (status) => {
      expect(isDeployedPortfolio(makePortfolio({ status }))).toBe(false)
    },
  )

  it("returns false when status is missing", () => {
    expect(
      isDeployedPortfolio(
        makePortfolio({ status: undefined as unknown as string }),
      ),
    ).toBe(false)
  })
})

describe("getFirstDeployedPortfolio", () => {
  it("returns null for an empty list", () => {
    expect(getFirstDeployedPortfolio([])).toBeNull()
  })

  it("returns null when no portfolios are deployed", () => {
    const portfolios = [
      makePortfolio({ status: "draft" }),
      makePortfolio({ status: "archived" }),
    ]
    expect(getFirstDeployedPortfolio(portfolios)).toBeNull()
  })

  it("returns the first deployed portfolio in the given order", () => {
    const draft = makePortfolio({
      id: "11111111-1111-1111-1111-111111111111" as Portfolio["id"],
      status: "draft",
    })
    const firstLive = makePortfolio({
      id: "22222222-2222-2222-2222-222222222222" as Portfolio["id"],
      status: "publish",
    })
    const secondLive = makePortfolio({
      id: "33333333-3333-3333-3333-333333333333" as Portfolio["id"],
      status: "active",
    })

    expect(getFirstDeployedPortfolio([draft, firstLive, secondLive])).toBe(
      firstLive,
    )
  })
})

describe("isExternalPortfolio", () => {
  it("returns true when source_type is 'external'", () => {
    expect(isExternalPortfolio(makePortfolio({ source_type: "external" }))).toBe(true)
  })

  it("returns true when sourceType (camelCase) is 'external'", () => {
    expect(isExternalPortfolio(makePortfolio({ sourceType: "external" }))).toBe(true)
  })

  it("normalizes casing on source_type", () => {
    expect(isExternalPortfolio(makePortfolio({ source_type: "EXTERNAL" }))).toBe(true)
  })

  it("returns true when source_type is not 'generated' and external_url is present", () => {
    expect(
      isExternalPortfolio(makePortfolio({ source_type: "imported", external_url: "https://example.com" })),
    ).toBe(true)
  })

  it("returns true when sourceType is not 'generated' and externalUrl (camelCase) is present", () => {
    expect(
      isExternalPortfolio(makePortfolio({ sourceType: "imported", externalUrl: "https://example.com" })),
    ).toBe(true)
  })

  it("returns false when source_type is 'generated' even with an external_url", () => {
    expect(
      isExternalPortfolio(makePortfolio({ source_type: "generated", external_url: "https://example.com" })),
    ).toBe(false)
  })

  it("returns false when source_type is absent and external_url is absent", () => {
    expect(isExternalPortfolio(makePortfolio({ source_type: null, external_url: null }))).toBe(false)
  })

  it("returns false when external_url is whitespace only", () => {
    expect(isExternalPortfolio(makePortfolio({ source_type: "imported", external_url: "   " }))).toBe(false)
  })
})

describe("formatPortfolioDate", () => {
  const PLACEHOLDER = "TBD (schema placeholder)"

  it("returns the placeholder for null, undefined, and empty string", () => {
    expect(formatPortfolioDate(null)).toBe(PLACEHOLDER)
    expect(formatPortfolioDate(undefined)).toBe(PLACEHOLDER)
    expect(formatPortfolioDate("")).toBe(PLACEHOLDER)
  })

  it("returns the placeholder for an invalid date string", () => {
    expect(formatPortfolioDate("not-a-date")).toBe(PLACEHOLDER)
  })

  it("formats a valid ISO timestamp with short month, day, and year", () => {
    const result = formatPortfolioDate("2026-03-15T12:00:00Z")
    // Locale-dependent, but should contain a 3-letter-ish month and the year.
    expect(result).not.toBe(PLACEHOLDER)
    expect(result).toMatch(/2026/)
  })
})

describe("formatFieldValue", () => {
  const PLACEHOLDER = "TBD (schema placeholder)"

  it("returns the placeholder for null, undefined, empty, and whitespace-only values", () => {
    expect(formatFieldValue(null)).toBe(PLACEHOLDER)
    expect(formatFieldValue(undefined)).toBe(PLACEHOLDER)
    expect(formatFieldValue("")).toBe(PLACEHOLDER)
    expect(formatFieldValue("   ")).toBe(PLACEHOLDER)
  })

  it("returns the trimmed value for non-empty strings", () => {
    expect(formatFieldValue("hello")).toBe("hello")
    expect(formatFieldValue("  hello  ")).toBe("hello")
  })
})
