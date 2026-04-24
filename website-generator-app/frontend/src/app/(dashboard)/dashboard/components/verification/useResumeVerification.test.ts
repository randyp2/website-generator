// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react"
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

    const { result } = renderHook(() => useResumeVerification(vi.fn()))

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

    const { result } = renderHook(() => useResumeVerification(vi.fn()))

    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    expect(result.current.hasPersisted).toBe(true)
    expect(result.current.resumeVerificationId).toBe("rv-abc")
    expect(result.current.resume?.name).toBe("my-resume.pdf")
    expect(result.current.parsedData).toEqual({ skills: ["React"] })
  })

  it("sets isLoadingExisting to false even when hydration returns no data", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => null })

    const { result } = renderHook(() => useResumeVerification(vi.fn()))

    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    expect(result.current.hasPersisted).toBe(false)
    expect(result.current.resume).toBeNull()
  })

  it("sets isLoadingExisting to false when hydration fetch fails", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(404))

    const { result } = renderHook(() => useResumeVerification(vi.fn()))

    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    expect(result.current.hasPersisted).toBe(false)
  })

  it("sets isLoadingExisting to false when fetch throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useResumeVerification(vi.fn()))

    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    expect(result.current.hasPersisted).toBe(false)
  })

  // ─── handleResumeUploaded ─────────────────────────────────────────────────

  it("handleResumeUploaded sets resume state and navigates to resume-review", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))

    const setActiveTab = vi.fn()
    const { result } = renderHook(() => useResumeVerification(setActiveTab))
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
    const { result } = renderHook(() => useResumeVerification(setActiveTab))
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    const first = makeResumeFile("first.pdf", "blob:first-url")
    act(() => { result.current.handleResumeUploaded(first) })

    const second = makeResumeFile("second.pdf", "blob:second-url")
    act(() => { result.current.handleResumeUploaded(second) })

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:first-url")
    expect(result.current.resume?.name).toBe("second.pdf")
  })

  // ─── handleResumeRemoved ──────────────────────────────────────────────────

  it("handleResumeRemoved resets state and navigates without calling DELETE when not persisted", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))

    const setActiveTab = vi.fn()
    const { result } = renderHook(() => useResumeVerification(setActiveTab))
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
    const { result } = renderHook(() => useResumeVerification(setActiveTab))
    await waitFor(() => expect(result.current.hasPersisted).toBe(true))

    await act(async () => { await result.current.handleResumeRemoved() })

    const deleteCall = fetchMock.mock.calls.find(
      ([url, opts]: [string, RequestInit]) =>
        url === "/api/profile/resume-verification" && opts?.method === "DELETE",
    )
    expect(deleteCall).toBeDefined()
    expect(result.current.hasPersisted).toBe(false)
  })

  // ─── handleContinueToSkillVerification ────────────────────────────────────

  it("handleContinueToSkillVerification is a no-op when resume is null", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))

    const setActiveTab = vi.fn()
    const { result } = renderHook(() => useResumeVerification(setActiveTab))
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
    const { result } = renderHook(() => useResumeVerification(setActiveTab))
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
    const { result } = renderHook(() => useResumeVerification(setActiveTab))
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

  it("handleContinueToSkillVerification sets uploadError on failure", async () => {
    fetchMock.mockResolvedValueOnce(makeErrorResponse(204))
    const { result } = renderHook(() => useResumeVerification(vi.fn()))
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
    const { result } = renderHook(() => useResumeVerification(vi.fn()))
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
    const { result } = renderHook(() => useResumeVerification(setActiveTab))
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

  it("handleConfirmSkills sets ingestError on failure", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ id: "rv-1", originalFileName: "r.pdf", fileSizeBytes: 1024 }),
    )

    const { result } = renderHook(() => useResumeVerification(vi.fn()))
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
    const { result } = renderHook(() => useResumeVerification(vi.fn()))
    await waitFor(() => expect(result.current.isLoadingExisting).toBe(false))

    fetchMock.mockClear()
    await act(async () => { await result.current.saveReview(["React"], []) })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("saveReview calls PATCH review endpoint when verificationId exists", async () => {
    fetchMock.mockResolvedValueOnce(
      makeOkResponse({ id: "rv-1", originalFileName: "r.pdf", fileSizeBytes: 1024 }),
    )

    const { result } = renderHook(() => useResumeVerification(vi.fn()))
    await waitFor(() => expect(result.current.resumeVerificationId).toBe("rv-1"))

    fetchMock.mockResolvedValueOnce(makeOkResponse({}))

    await act(async () => { await result.current.saveReview(["React", "TypeScript"], []) })

    const reviewCall = fetchMock.mock.calls.find(
      ([url, opts]: [string, RequestInit]) =>
        url === "/api/profile/resume-verification/review" && opts?.method === "PATCH",
    )
    expect(reviewCall).toBeDefined()
  })
})
