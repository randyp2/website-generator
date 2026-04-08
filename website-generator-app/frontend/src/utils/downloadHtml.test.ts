// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { SectionDTO } from "@/types/portfolio"

import { downloadPortfolioHtml, sanitizeFilename } from "./downloadHtml"

const makeSection = (overrides: Partial<SectionDTO> = {}): SectionDTO => ({
  sectionKey: "about",
  title: "About",
  orderIndex: 0,
  contentJson: { bio: "hi" },
  reactSource: "<section>About</section>",
  changeDescription: null,
  ...overrides,
})

interface MockResponseInit {
  ok: boolean
  status?: number
  html?: string
  jsonBody?: unknown
  jsonThrows?: boolean
}

const mockResponse = ({
  ok,
  status = ok ? 200 : 500,
  html = "",
  jsonBody = {},
  jsonThrows = false,
}: MockResponseInit): Response =>
  ({
    ok,
    status,
    text: vi.fn(async () => html),
    json: vi.fn(async () => {
      if (jsonThrows) throw new Error("bad json")
      return jsonBody
    }),
  }) as unknown as Response

describe("sanitizeFilename", () => {
  it("lowercases and replaces non-alphanumeric runs with a single dash", () => {
    expect(sanitizeFilename("My Portfolio")).toBe("my-portfolio")
    expect(sanitizeFilename("My  Portfolio!!")).toBe("my-portfolio")
  })

  it("trims leading and trailing dashes", () => {
    expect(sanitizeFilename("  My Portfolio  ")).toBe("my-portfolio")
    expect(sanitizeFilename("---hello---")).toBe("hello")
  })

  it('falls back to "portfolio" when the sanitized result would be empty', () => {
    expect(sanitizeFilename("")).toBe("portfolio")
    expect(sanitizeFilename("///---")).toBe("portfolio")
    expect(sanitizeFilename("   ")).toBe("portfolio")
  })

  it("caps the filename length at 50 characters", () => {
    const long = "a".repeat(100)
    const result = sanitizeFilename(long)
    expect(result.length).toBeLessThanOrEqual(50)
    expect(result).toBe("a".repeat(50))
  })

  it("strips non-ASCII characters (documents current behavior)", () => {
    // "Résumé" → "r" + "-" (é) + "sum" + "-" (é) → "r-sum-" → trimmed "r-sum"
    expect(sanitizeFilename("Résumé")).toBe("r-sum")
  })

  it("preserves digits", () => {
    expect(sanitizeFilename("Portfolio 2026 v2")).toBe("portfolio-2026-v2")
  })
})

describe("downloadPortfolioHtml", () => {
  const createObjectURL = vi.fn<(blob: Blob) => string>(
    () => "blob:mock-url",
  )
  const revokeObjectURL = vi.fn<(url: string) => void>()
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    document.body.innerHTML = ""
  })

  it("throws when portfolioId is empty", async () => {
    await expect(
      downloadPortfolioHtml("", [makeSection()], null, "My Portfolio"),
    ).rejects.toThrow("Portfolio ID is required")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("throws when sections is empty", async () => {
    await expect(
      downloadPortfolioHtml("pid-1", [], null, "My Portfolio"),
    ).rejects.toThrow("No sections to export")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("throws when sections is null-ish", async () => {
    await expect(
      downloadPortfolioHtml(
        "pid-1",
        null as unknown as SectionDTO[],
        null,
        "My Portfolio",
      ),
    ).rejects.toThrow("No sections to export")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("POSTs sections, theme, and title to the export endpoint", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ ok: true, html: "<html></html>" }),
    )
    const sections = [makeSection()]
    const theme = {
      background: "bg-black",
      textPrimary: "text-white",
      textSecondary: "text-gray-400",
      accentColor: "purple",
    }

    await downloadPortfolioHtml("pid-1", sections, theme, "My Portfolio")

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/portfolio/pid-1/export/html")
    expect(init?.method).toBe("POST")
    expect(init?.headers).toEqual({ "Content-Type": "application/json" })
    expect(JSON.parse(init?.body as string)).toEqual({
      sections,
      globalTheme: theme,
      pageTitle: "My Portfolio",
    })
  })

  it('defaults the pageTitle to "Portfolio" when title is empty', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ ok: true, html: "<html></html>" }),
    )

    await downloadPortfolioHtml("pid-1", [makeSection()], null, "")

    const init = fetchMock.mock.calls[0][1]
    expect(JSON.parse(init?.body as string).pageTitle).toBe("Portfolio")
  })

  it("triggers a download anchor with a sanitized filename on success", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ ok: true, html: "<html><body>hi</body></html>" }),
    )

    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    const createSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        const el = originalCreateElement(tag) as HTMLAnchorElement
        if (tag === "a") el.click = clickSpy
        return el
      })

    await downloadPortfolioHtml(
      "pid-1",
      [makeSection()],
      null,
      "My Portfolio!!",
    )

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = createObjectURL.mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe("text/html")

    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url")
    // Anchor is cleaned up after click
    expect(document.body.querySelector("a")).toBeNull()

    createSpy.mockRestore()
  })

  it("throws the server-provided error message when the response is not ok", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 500,
        jsonBody: { error: "Export worker crashed" },
      }),
    )

    await expect(
      downloadPortfolioHtml("pid-1", [makeSection()], null, "Title"),
    ).rejects.toThrow("Export worker crashed")
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it("throws a default error when the response is not ok and the body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ ok: false, status: 500, jsonThrows: true }),
    )

    await expect(
      downloadPortfolioHtml("pid-1", [makeSection()], null, "Title"),
    ).rejects.toThrow("Failed to generate HTML")
    expect(createObjectURL).not.toHaveBeenCalled()
  })
})
