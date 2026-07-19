import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { SyncProviderResponseDTO } from "@/types/connection"

import {
  deleteClaimRequest,
  fetchClaimUploadById,
  fetchJobStatus,
  resolveErrorMessage,
  runConnectionActionRequest,
  runConnectionSyncRequest,
} from "./verification.api"
import type { ClaimUpload } from "./verification.types"

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

const textResponse = (body: string, status = 500): Response =>
  new Response(body, {
    status,
    headers: { "Content-Type": "text/plain" },
  })

const makeSyncPayload = (
  overrides: Partial<SyncProviderResponseDTO> = {},
): SyncProviderResponseDTO => ({
  provider: "github",
  syncStatus: "success",
  startedAt: null,
  completedAt: null,
  tokenRefreshed: false,
  evidence: {
    fetched: 1,
    inserted: 1,
    updated: 0,
    unchanged: 0,
  },
  links: {
    inserted: 1,
    updated: 0,
    removed: 0,
    claimsMatched: 1,
  },
  error: null,
  ...overrides,
})

describe("verification.api", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("resolveErrorMessage", () => {
    it("uses API error text when available", async () => {
      await expect(
        resolveErrorMessage(jsonResponse({ error: "Provider failed" }, 400), "Fallback"),
      ).resolves.toBe("Provider failed")
    })

    it("falls back when the response body is not usable JSON", async () => {
      await expect(
        resolveErrorMessage(textResponse("not-json"), "Fallback"),
      ).resolves.toBe("Fallback")
    })
  })

  describe("runConnectionActionRequest", () => {
    it("connects a provider and returns its authorization URL", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          authorizationUrl: "https://provider.example/auth",
          connection: {},
          state: "state-1",
        }),
      )

      await expect(
        runConnectionActionRequest("github", "connect"),
      ).resolves.toEqual({
        authorizationUrl: "https://provider.example/auth",
      })

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/profile/resume-verification/connections/github/connect",
        { method: "POST" },
      )
    })

    it("rejects connect responses without a usable authorization URL", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          authorizationUrl: 42,
          connection: {},
          state: null,
        }),
      )

      await expect(
        runConnectionActionRequest("github", "connect"),
      ).rejects.toThrow("authorization URL is missing")
    })

    it("disconnects a provider without an authorization URL", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ connection: {} }))

      await expect(
        runConnectionActionRequest("linkedin", "disconnect"),
      ).resolves.toEqual({ authorizationUrl: null })

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/profile/resume-verification/connections/linkedin",
        { method: "DELETE" },
      )
    })

    it("throws the API error message for failed actions", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ error: "Connection expired" }, 401),
      )

      await expect(
        runConnectionActionRequest("github", "disconnect"),
      ).rejects.toThrow("Connection expired")
    })
  })

  describe("runConnectionSyncRequest", () => {
    it("runs a provider sync and returns the payload", async () => {
      const payload = makeSyncPayload()
      fetchMock.mockResolvedValueOnce(jsonResponse(payload))

      await expect(runConnectionSyncRequest("github")).resolves.toEqual(payload)

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/profile/resume-verification/connections/github/sync",
        { method: "POST" },
      )
    })

    it("throws when the sync request itself fails", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Sync denied" }, 403))

      await expect(runConnectionSyncRequest("github")).rejects.toThrow("Sync denied")
    })

    it("throws when the completed sync reports failed status", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(makeSyncPayload({ syncStatus: "failed", error: "Bad token" })),
      )

      await expect(runConnectionSyncRequest("github")).rejects.toThrow("Bad token")
    })
  })

  describe("fetchJobStatus", () => {
    it("returns a job status payload", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ jobId: "job-1", status: "COMPLETED", error: null }),
      )

      await expect(fetchJobStatus("job-1")).resolves.toEqual({
        jobId: "job-1",
        status: "COMPLETED",
        error: null,
      })
    })

    it("returns null for failed responses and thrown fetches", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Missing" }, 404))
      await expect(fetchJobStatus("missing")).resolves.toBeNull()

      fetchMock.mockRejectedValueOnce(new Error("Network down"))
      await expect(fetchJobStatus("job-2")).resolves.toBeNull()
    })
  })

  describe("fetchClaimUploadById", () => {
    const upload: ClaimUpload = {
      id: "upload-1",
      originalFileName: "resume.pdf",
      status: "COMPLETED",
      createdAt: "2026-01-01T00:00:00.000Z",
    }

    it("returns the requested upload from the claim upload list", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ items: [{ ...upload, id: "other" }, upload] }),
      )

      await expect(fetchClaimUploadById("claim-1", "upload-1")).resolves.toEqual(
        upload,
      )
    })

    it("returns null when the upload cannot be read or found", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ items: [] }))
      await expect(fetchClaimUploadById("claim-1", "missing")).resolves.toBeNull()

      fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Nope" }, 500))
      await expect(fetchClaimUploadById("claim-1", "upload-1")).resolves.toBeNull()

      fetchMock.mockRejectedValueOnce(new Error("Network down"))
      await expect(fetchClaimUploadById("claim-1", "upload-1")).resolves.toBeNull()
    })
  })

  describe("deleteClaimRequest", () => {
    it("returns the successful delete response", async () => {
      const response = new Response(null, { status: 204 })
      fetchMock.mockResolvedValueOnce(response)

      await expect(deleteClaimRequest("claim-1")).resolves.toBe(response)

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/profile/resume-verification/claims/claim-1",
        { method: "DELETE" },
      )
    })

    it("throws a readable error when delete fails", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Cannot delete" }, 409))

      await expect(deleteClaimRequest("claim-1")).rejects.toThrow("Cannot delete")
    })
  })
})
