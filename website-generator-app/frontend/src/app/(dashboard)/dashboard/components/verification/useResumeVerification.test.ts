// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createElement, type ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import useResumeVerification from "./useResumeVerification"
import type { ResumeFile } from "./verification.types"

// jsdom doesn't implement URL.revokeObjectURL
global.URL.revokeObjectURL = vi.fn()

const makeResumeFile = (name = "resume.pdf", url = "blob:fake-url"): ResumeFile => ({
  name,
  size: "100 KB",
  url,
  file: new File(["content"], name, { type: "application/pdf" }),
})

const makeOkResponse = (body: unknown) => ({
  ok: true,
  json: async () => body,
  text: async () => JSON.stringify(body),
})

const makeErrorResponse = (status = 500) => ({
  ok: false,
  status,
  json: async () => ({ error: "Server error" }),
  text: async () => "Server error",
})

const createQueryWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  function TestQueryProvider({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }

  return TestQueryProvider
}

const renderResumeVerificationHook = (
  setActiveTab: Parameters<typeof useResumeVerification>[0] = vi.fn(),
  options?: Parameters<typeof useResumeVerification>[1],
) =>
  renderHook(() => useResumeVerification(setActiveTab, options), {
    wrapper: createQueryWrapper(),
  })

describe("useResumeVerification", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── Hydration ─────────────────────────────────────────────────────────────

  it("starts with isLoadingExisting: true and no resume", () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null))

    const { result } = renderResumeVerificationHook()

    expect(result.current.isLoadingExisting).toBe(true)
    expect(result.current.resume).toBeNull()
    expect(result.current.hasPersisted).toBe(false)
  })

  it("hydrates resume state from backend on mount", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({
        id: "rv-abc",
        originalFileName: "my-resume.pdf",
        fileSizeBytes: 51200,
        parsedJson: { skills: ["React"] },
      }),
    )

    const { result } = renderResumeVerificationHook()

    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    expect(result.current.hasPersisted).toBe(true)
    expect(result.current.resumeVerificationId).toBe("rv-abc")
    expect(result.current.resume?.name).toBe("my-resume.pdf")
    expect(result.current.parsedData).toEqual({ skills: ["React"] })
  })

  it("sets isLoadingExisting to false even when hydration returns no data", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => null })

    const { result } = renderResumeVerificationHook()

    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    expect(result.current.hasPersisted).toBe(false)
    expect(result.current.resume).toBeNull()
  })

  it("sets isLoadingExisting to false when hydration fetch fails", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(404))

    const { result } = renderResumeVerificationHook()

    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    expect(result.current.hasPersisted).toBe(false)
  })

  it("sets isLoadingExisting to false when fetch throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderResumeVerificationHook()

    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    expect(result.current.hasPersisted).toBe(false)
  })

  // ─── handleResumeUploaded ─────────────────────────────────────────────────

  it("handleResumeUploaded sets resume state and navigates to resume-review", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))

    const setActiveTab = vi.fn()
    const { result } = renderResumeVerificationHook(setActiveTab)
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    const file = makeResumeFile()
    act(() => {
      result.current.handleResumeUploaded(file)
    })

    expect(result.current.resume).toBe(file)
    expect(result.current.uploadError).toBeNull()
    expect(setActiveTab).toHaveBeenCalledWith("resume-review")
  })

  it("handleResumeUploaded revokes the previous blob URL if one exists", async () => {
    fetchMock
      .mockResolvedValueOnce(makeErrorResponse(204))

    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL")
    const setActiveTab = vi.fn()
    const { result } = renderResumeVerificationHook(setActiveTab)
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    const first = makeResumeFile("first.pdf", "blob:first-url")
    act(() => { result.current.handleResumeUploaded(first) })

    const second = makeResumeFile("second.pdf", "blob:second-url")
    act(() => { result.current.handleResumeUploaded(second) })

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:first-url")
    expect(result.current.resume?.name).toBe("second.pdf")
  })

  it("revokes the current blob URL on unmount", async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null))

    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL")
    const { result, unmount } = renderResumeVerificationHook()
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    act(() => {
      result.current.handleResumeUploaded(
        makeResumeFile("cleanup.pdf", "blob:cleanup-url"),
      )
    })

    unmount()

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:cleanup-url")
  })

  // ─── handleResumeRemoved ──────────────────────────────────────────────────

  it("handleResumeRemoved resets state and navigates without calling DELETE when not persisted", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))

    const setActiveTab = vi.fn()
    const { result } = renderResumeVerificationHook(setActiveTab)
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    act(() => { result.current.handleResumeUploaded(makeResumeFile()) })

    fetchMock.mockClear()

    await act(async () => { await result.current.handleResumeRemoved() })

    // No DELETE call since hasPersisted is false
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.resume).toBeNull()
    expect(result.current.resumeVerificationId).toBeNull()
    expect(result.current.parsedData).toBeNull()
    expect(result.current.hasPersisted).toBe(false)
    expect(setActiveTab).toHaveBeenLastCalledWith("resume-review")
  })

  it("handleResumeRemoved calls DELETE when hasPersisted is true", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ id: "rv-1", originalFileName: "r.pdf", fileSizeBytes: 1024 }),
    )
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    const setActiveTab = vi.fn()
    const { result } = renderResumeVerificationHook(setActiveTab)
    await waitFor(() => expect(result.current.hasPersisted).toBe(true))

    await act(async () => { await result.current.handleResumeRemoved() })

    const deleteCall = fetchMock.mock.calls.find((call) => {
      const [url, opts] = call as [string, RequestInit | undefined]
      return (
        url === "/api/profile/resume-verification" && opts?.method === "DELETE"
      )
    })
    expect(deleteCall).toBeDefined()
    expect(result.current.hasPersisted).toBe(false)
  })

  it("handleResumeRemoved still resets state when DELETE throws", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ id: "rv-1", originalFileName: "r.pdf", fileSizeBytes: 1024 }),
    )

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const setActiveTab = vi.fn()
    const { result } = renderResumeVerificationHook(setActiveTab)
    await waitFor(() => expect(result.current.hasPersisted).toBe(true))

    fetchMock.mockRejectedValueOnce(new Error("Delete failed"))

    await act(async () => { await result.current.handleResumeRemoved() })

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to delete resume verification:",
      expect.any(Error),
    )
    expect(result.current.hasPersisted).toBe(false)
    expect(setActiveTab).toHaveBeenLastCalledWith("resume-review")
  })

  // ─── handleContinueToSkillVerification ────────────────────────────────────

  it("handleContinueToSkillVerification is a no-op when resume is null", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))

    const setActiveTab = vi.fn()
    const { result } = renderResumeVerificationHook(setActiveTab)
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    fetchMock.mockClear()
    await act(async () => { await result.current.handleContinueToSkillVerification() })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(setActiveTab).not.toHaveBeenCalled()
  })

  it("handleContinueToSkillVerification navigates directly when already persisted", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ id: "rv-1", originalFileName: "r.pdf", fileSizeBytes: 1024 }),
    )

    const setActiveTab = vi.fn()
    const { result } = renderResumeVerificationHook(setActiveTab)
    await waitFor(() => expect(result.current.hasPersisted).toBe(true))

    setActiveTab.mockClear()
    fetchMock.mockClear()

    await act(async () => { await result.current.handleContinueToSkillVerification() })

    expect(setActiveTab).toHaveBeenCalledWith("skill-review")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("handleContinueToSkillVerification uploads file and navigates to skill-review", async () => {
    // Hydration returns no resume
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))
    const setActiveTab = vi.fn()
    const { result } = renderResumeVerificationHook(setActiveTab)
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    act(() => { result.current.handleResumeUploaded(makeResumeFile()) })

    // Upload response
    fetchMock.mockResolvedValueOnce(makeOkResponse({ id: "rv-new" }))
    // Parse response (called in background)
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ success: true, data: { skills: ["React"], experiences: [] } }),
    )
    // PATCH parsed data response
    fetchMock.mockResolvedValueOnce(makeOkResponse({}))

    await act(async () => { await result.current.handleContinueToSkillVerification() })

    expect(result.current.hasPersisted).toBe(true)
    expect(result.current.resumeVerificationId).toBe("rv-new")
    expect(setActiveTab).toHaveBeenCalledWith("skill-review")
  })

  it("handleContinueToSkillVerification persists parsed data and updatedAt", async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null))
    const { result } = renderResumeVerificationHook()
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    act(() => { result.current.handleResumeUploaded(makeResumeFile()) })

    fetchMock.mockResolvedValueOnce(makeOkResponse({ id: "rv-new" }))
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({
        success: true,
        data: {
          skills: ["React"],
          experiences: [],
          normalizedText: "Resume text",
        },
      }),
    )
    fetchMock.mockResolvedValueOnce(makeOkResponse({ updatedAt: "parsed-at" }))

    await act(async () => { await result.current.handleContinueToSkillVerification() })

    await waitFor(() => {
      expect(result.current.parsedData).toMatchObject({ skills: ["React"] })
      expect(result.current.resumeUpdatedAt).toBe("parsed-at")
    })
  })

  it("handleContinueToSkillVerification stores parsingError when parsing fails", async () => {
    fetchMock.mockResolvedValueOnce(makeOkResponse(null))
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const { result } = renderResumeVerificationHook()
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    act(() => { result.current.handleResumeUploaded(makeResumeFile()) })

    fetchMock.mockResolvedValueOnce(makeOkResponse({ id: "rv-new" }))
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500))

    await act(async () => { await result.current.handleContinueToSkillVerification() })

    await waitFor(() => {
      expect(result.current.parsingError).toBe(
        "Failed to parse resume. You can add skills manually.",
      )
    })
    expect(consoleError).toHaveBeenCalledWith(
      "Resume verification parsing failed:",
      expect.any(Error),
    )
  })

  it("handleContinueToSkillVerification sets uploadError on failure", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))
    const { result } = renderResumeVerificationHook()
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    act(() => { result.current.handleResumeUploaded(makeResumeFile()) })

    fetchMock.mockResolvedValueOnce(makeErrorResponse(500))

    await act(async () => { await result.current.handleContinueToSkillVerification() })

    expect(result.current.uploadError).toBeTruthy()
    expect(result.current.hasPersisted).toBe(false)
  })

  // ─── handleConfirmSkills ──────────────────────────────────────────────────

  it("handleConfirmSkills is a no-op when resumeVerificationId is null", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))
    const { result } = renderResumeVerificationHook()
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    fetchMock.mockClear()
    await act(async () => { await result.current.handleConfirmSkills(["React"], []) })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("handleConfirmSkills ingest skills and navigates to skill-verification", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ id: "rv-1", originalFileName: "r.pdf", fileSizeBytes: 1024 }),
    )

    const setActiveTab = vi.fn()
    const { result } = renderResumeVerificationHook(setActiveTab)
    await waitFor(() => expect(result.current.resumeVerificationId).toBe("rv-1"))

    // PATCH review
    fetchMock.mockResolvedValueOnce(makeOkResponse({}))
    // POST ingest
    fetchMock.mockResolvedValueOnce(makeOkResponse({ ingested: 3 }))

    await act(async () => {
      await result.current.handleConfirmSkills(["React", "TypeScript", "Node.js"], [])
    })

    expect(setActiveTab).toHaveBeenLastCalledWith("skill-verification")
    expect(result.current.isIngesting).toBe(false)
    expect(result.current.ingestError).toBeNull()
  })

  it("handleConfirmSkills keeps navigating when post-confirm refresh fails", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({
        id: "rv-1",
        originalFileName: "r.pdf",
        fileSizeBytes: 1024,
        parsedJson: { skills: ["React"], experiences: [] },
      }),
    )

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const setActiveTab = vi.fn()
    const onConfirmIngested = vi.fn().mockRejectedValue(new Error("Refresh failed"))
    const { result } = renderResumeVerificationHook(setActiveTab, {
      onConfirmIngested,
    })
    await waitFor(() => expect(result.current.resumeVerificationId).toBe("rv-1"))

    fetchMock.mockResolvedValueOnce(makeOkResponse({ updatedAt: "reviewed-at" }))
    fetchMock.mockResolvedValueOnce(makeOkResponse({ ingested: 1 }))

    await act(async () => {
      await result.current.handleConfirmSkills(["React"], [])
    })

    expect(onConfirmIngested).toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith(
      "Post-confirm verification refresh failed:",
      expect.any(Error),
    )
    expect(result.current.resumeUpdatedAt).toBe("reviewed-at")
    expect(setActiveTab).toHaveBeenLastCalledWith("skill-verification")
  })

  it("handleConfirmSkills sets ingestError on failure", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ id: "rv-1", originalFileName: "r.pdf", fileSizeBytes: 1024 }),
    )

    const { result } = renderResumeVerificationHook()
    await waitFor(() => expect(result.current.resumeVerificationId).toBe("rv-1"))

    // PATCH review
    fetchMock.mockResolvedValueOnce(makeOkResponse({}))
    // POST ingest fails
    fetchMock.mockResolvedValueOnce(makeErrorResponse(500))

    await act(async () => {
      await result.current.handleConfirmSkills(["React"], [])
    })

    expect(result.current.ingestError).toBeTruthy()
    expect(result.current.isIngesting).toBe(false)
  })

  // ─── saveReview ───────────────────────────────────────────────────────────

  it("saveReview is a no-op when resumeVerificationId is null", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))
    const { result } = renderResumeVerificationHook()
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    fetchMock.mockClear()
    await act(async () => { await result.current.saveReview(["React"], []) })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("saveReview calls PATCH review endpoint when verificationId exists", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ id: "rv-1", originalFileName: "r.pdf", fileSizeBytes: 1024 }),
    )

    const { result } = renderResumeVerificationHook()
    await waitFor(() => expect(result.current.resumeVerificationId).toBe("rv-1"))

    fetchMock.mockResolvedValueOnce(makeOkResponse({}))

    await act(async () => { await result.current.saveReview(["React", "TypeScript"], []) })

    const reviewCall = fetchMock.mock.calls.find((call) => {
      const [url, opts] = call as [string, RequestInit | undefined]
      return (
        url === "/api/profile/resume-verification/review" && opts?.method === "PATCH"
      )
    })
    expect(reviewCall).toBeDefined()
  })

  it("saveReview updates resumeUpdatedAt from the review response", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ id: "rv-1", originalFileName: "r.pdf", fileSizeBytes: 1024 }),
    )

    const { result } = renderResumeVerificationHook()
    await waitFor(() => expect(result.current.resumeVerificationId).toBe("rv-1"))

    fetchMock.mockResolvedValueOnce(makeOkResponse({ updatedAt: "autosaved-at" }))

    await act(async () => { await result.current.saveReview(["React"], []) })

    expect(result.current.resumeUpdatedAt).toBe("autosaved-at")
  })

  it("saveReview logs autosave errors without throwing", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ id: "rv-1", originalFileName: "r.pdf", fileSizeBytes: 1024 }),
    )

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const { result } = renderResumeVerificationHook()
    await waitFor(() => expect(result.current.resumeVerificationId).toBe("rv-1"))

    fetchMock.mockRejectedValueOnce(new Error("Autosave failed"))

    await act(async () => { await result.current.saveReview(["React"], []) })

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to autosave review:",
      expect.any(Error),
    )
  })
})
