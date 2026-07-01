// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createElement, type ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { ClaimDTO } from "@/types/claim"
import type { ConnectedAccountDTO, SyncProviderResponseDTO } from "@/types/connection"
import type { EvidenceDTO } from "@/types/evidence"
import type { VerificationSummaryDTO } from "@/types/verification-summary"

import type { JobStatusResponse } from "./verification.api"
import type { ClaimUpload } from "./verification.types"
import {
  fetchClaimUploads,
  fetchResumeVerificationRecord,
  fetchVerificationClaims,
  fetchVerificationConnections,
  fetchVerificationEvidence,
  fetchVerificationSummary,
  invalidateClaimVerificationQueries,
  invalidateVerificationQueries,
  useAssetJobStatusQuery,
  useClaimUploadQuery,
  useClaimUploadsQuery,
  useConnectionActionMutation,
  useDeleteClaimMutation,
  useInvalidateVerificationQueries,
  useResumeVerificationRecordQuery,
  useRunConnectionSyncMutation,
  useVerificationClaimsQuery,
  useVerificationConnectionsQuery,
  useVerificationEvidenceQuery,
  useVerificationSummaryQuery,
  verificationQueryKeys,
} from "./verification.query"

type QueryCacheEntry = ReturnType<
  ReturnType<QueryClient["getQueryCache"]>["find"]
>
type RefetchIntervalFn = (
  query: NonNullable<QueryCacheEntry>,
) => number | false | undefined

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

const responseWithTextError = (message: string): Response =>
  ({
    ok: false,
    json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
    text: vi.fn().mockResolvedValue(message),
  }) as unknown as Response

const createTestQueryClient = () =>
  new QueryClient({
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

const createQueryWrapper = (queryClient: QueryClient) => {
  function TestQueryProvider({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }

  return TestQueryProvider
}

const renderWithQueryClient = <T,>(callback: () => T) => {
  const queryClient = createTestQueryClient()

  return {
    queryClient,
    ...renderHook(callback, {
      wrapper: createQueryWrapper(queryClient),
    }),
  }
}

const summary: VerificationSummaryDTO = {
  scoreType: "profile",
  baselineOverallScore: 70,
  evidenceDelta: 10,
  overallScore: 80,
  totalSkills: 3,
  matchedSkills: 2,
  unmatchedSkills: 1,
  normalizedCoverage: 0.66,
  sourceQuality: 0.8,
  parserConfidence: 0.9,
  profileScoreNarrative: "Good coverage",
  claims: [],
  unverifiedClaims: [],
  suggestedActions: [],
  generatedAt: "2026-01-01T00:00:00.000Z",
}

const claim = {
  id: "claim-1",
  rawValue: "React",
} as ClaimDTO

const evidence = {
  id: "evidence-1",
  provider: "github",
} as EvidenceDTO

const connection = {
  id: "connection-1",
  provider: "github",
} as ConnectedAccountDTO

const upload: ClaimUpload = {
  id: "upload-1",
  originalFileName: "resume.pdf",
  status: "COMPLETED",
  createdAt: "2026-01-01T00:00:00.000Z",
}

const jobStatus: JobStatusResponse = {
  jobId: "job-1",
  status: "PROCESSING",
  error: null,
}

const syncPayload: SyncProviderResponseDTO = {
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
}

describe("verification.query", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("builds stable verification query keys", () => {
    expect(verificationQueryKeys.summary()).toEqual(["verification", "summary"])
    expect(verificationQueryKeys.resumeVerification()).toEqual([
      "verification",
      "resume-verification",
    ])
    expect(verificationQueryKeys.claimUpload("claim-1", "upload-1")).toEqual([
      "verification",
      "claim-uploads",
      "claim-1",
      "upload",
      "upload-1",
    ])
    expect(verificationQueryKeys.assetJobStatus("job-1")).toEqual([
      "verification",
      "asset-job-status",
      "job-1",
    ])
  })

  describe("fetch helpers", () => {
    it("fetches verification summary, claims, evidence, connections, and uploads", async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(summary))
        .mockResolvedValueOnce(jsonResponse([claim]))
        .mockResolvedValueOnce(jsonResponse({ items: [evidence] }))
        .mockResolvedValueOnce(jsonResponse([connection]))
        .mockResolvedValueOnce(jsonResponse({ items: [upload] }))

      await expect(fetchVerificationSummary()).resolves.toEqual(summary)
      await expect(fetchVerificationClaims()).resolves.toEqual([claim])
      await expect(fetchVerificationEvidence()).resolves.toEqual([evidence])
      await expect(fetchVerificationConnections()).resolves.toEqual([connection])
      await expect(fetchClaimUploads("claim-1")).resolves.toEqual([upload])

      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "/api/profile/resume-verification/summary",
        { cache: "no-store", credentials: "same-origin" },
      )
      expect(fetchMock).toHaveBeenNthCalledWith(
        5,
        "/api/profile/resume-verification/claims/claim-1/evidence-uploads",
        { cache: "no-store", credentials: "same-origin" },
      )
    })

    it("normalizes empty resume records and non-array list payloads", async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({}, 404))
        .mockResolvedValueOnce(jsonResponse(null))
        .mockResolvedValueOnce(jsonResponse({ items: "not-array" }))
        .mockResolvedValueOnce(jsonResponse({}))

      await expect(fetchResumeVerificationRecord()).resolves.toBeNull()
      await expect(fetchResumeVerificationRecord()).resolves.toBeNull()
      await expect(fetchVerificationEvidence()).resolves.toEqual([])
      await expect(fetchClaimUploads("claim-1")).resolves.toEqual([])
    })

    it("throws readable errors from API error bodies and fallback text", async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ message: "Summary failed" }, 500))
        .mockResolvedValueOnce(responseWithTextError("Claims failed"))

      await expect(fetchVerificationSummary()).rejects.toThrow("Summary failed")
      await expect(fetchVerificationClaims()).rejects.toThrow("Claims failed")
    })
  })

  describe("query hooks", () => {
    it("loads summary, resume record, claims, evidence, and connection queries", async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(summary))
        .mockResolvedValueOnce(
          jsonResponse({
            id: "rv-1",
            originalFileName: "resume.pdf",
            fileSizeBytes: 1024,
          }),
        )
        .mockResolvedValueOnce(jsonResponse([claim]))
        .mockResolvedValueOnce(jsonResponse({ items: [evidence] }))
        .mockResolvedValueOnce(jsonResponse([connection]))

      const summaryResult = renderWithQueryClient(() => useVerificationSummaryQuery())
      await waitFor(() => expect(summaryResult.result.current.data).toEqual(summary))

      const resumeResult = renderWithQueryClient(() =>
        useResumeVerificationRecordQuery(),
      )
      await waitFor(() =>
        expect(resumeResult.result.current.data).toMatchObject({ id: "rv-1" }),
      )

      const claimsResult = renderWithQueryClient(() => useVerificationClaimsQuery())
      await waitFor(() => expect(claimsResult.result.current.data).toEqual([claim]))

      const evidenceResult = renderWithQueryClient(() =>
        useVerificationEvidenceQuery(),
      )
      await waitFor(() =>
        expect(evidenceResult.result.current.data).toEqual([evidence]),
      )

      const connectionsResult = renderWithQueryClient(() =>
        useVerificationConnectionsQuery(),
      )
      await waitFor(() =>
        expect(connectionsResult.result.current.data).toEqual([connection]),
      )
    })

    it("keeps claim uploads disabled without a claim id and fetches when present", async () => {
      const disabledResult = renderWithQueryClient(() => useClaimUploadsQuery(null))

      expect(disabledResult.result.current.fetchStatus).toBe("idle")
      expect(fetchMock).not.toHaveBeenCalled()

      fetchMock.mockResolvedValueOnce(jsonResponse({ items: [upload] }))
      const enabledResult = renderWithQueryClient(() =>
        useClaimUploadsQuery("claim-1"),
      )

      await waitFor(() =>
        expect(enabledResult.result.current.data).toEqual([upload]),
      )
    })

    it("loads asset job status and stops polling for completed jobs", async () => {
      const queryClient = createTestQueryClient()
      fetchMock.mockResolvedValueOnce(jsonResponse(jobStatus))

      const { result } = renderHook(() => useAssetJobStatusQuery("job-1"), {
        wrapper: createQueryWrapper(queryClient),
      })

      await waitFor(() => expect(result.current.data).toEqual(jobStatus))

      const query = queryClient.getQueryCache().find({
        queryKey: verificationQueryKeys.assetJobStatus("job-1"),
      })
      expect(query).toBeDefined()

      const interval = (query?.options as { refetchInterval?: unknown } | undefined)
        ?.refetchInterval
      expect(typeof interval).toBe("function")

      const resolveInterval = interval as RefetchIntervalFn
      expect(resolveInterval(query as NonNullable<QueryCacheEntry>)).toBe(1500)

      queryClient.setQueryData(verificationQueryKeys.assetJobStatus("job-1"), {
        ...jobStatus,
        status: "COMPLETED",
      })
      const completedQuery = queryClient.getQueryCache().find({
        queryKey: verificationQueryKeys.assetJobStatus("job-1"),
      })

      expect(
        resolveInterval(completedQuery as NonNullable<QueryCacheEntry>),
      ).toBe(false)
    })

    it("keeps individual upload lookup disabled until claim and upload ids exist", async () => {
      const disabledResult = renderWithQueryClient(() =>
        useClaimUploadQuery({ claimId: "", uploadId: "", enabled: true }),
      )

      expect(disabledResult.result.current.fetchStatus).toBe("idle")
      expect(fetchMock).not.toHaveBeenCalled()

      fetchMock.mockResolvedValueOnce(jsonResponse({ items: [upload] }))
      const enabledResult = renderWithQueryClient(() =>
        useClaimUploadQuery({
          claimId: "claim-1",
          uploadId: "upload-1",
          enabled: true,
        }),
      )

      await waitFor(() => expect(enabledResult.result.current.data).toEqual(upload))
    })
  })

  describe("invalidation helpers and mutation hooks", () => {
    it("invalidates verification query groups", async () => {
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")

      await invalidateVerificationQueries(queryClient)

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: verificationQueryKeys.summary(),
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: verificationQueryKeys.claimUploadsRoot(),
      })
    })

    it("invalidates claim-scoped query groups", async () => {
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")

      await invalidateClaimVerificationQueries(queryClient, "claim-1")

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: verificationQueryKeys.claimUploads("claim-1"),
      })
      expect(invalidateSpy).toHaveBeenCalledTimes(4)
    })

    it("returns an invalidate callback bound to the active query client", async () => {
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")
      const { result } = renderHook(() => useInvalidateVerificationQueries(), {
        wrapper: createQueryWrapper(queryClient),
      })

      await act(async () => {
        await result.current()
      })

      expect(invalidateSpy).toHaveBeenCalledTimes(5)
    })

    it("runs connection action mutations and invalidates after disconnect", async () => {
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")
      const { result } = renderHook(() => useConnectionActionMutation(), {
        wrapper: createQueryWrapper(queryClient),
      })

      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          authorizationUrl: "https://provider.example/auth",
          connection: {},
          state: null,
        }),
      )

      await act(async () => {
        await result.current.mutateAsync({
          provider: "github",
          action: "connect",
        })
      })
      expect(invalidateSpy).not.toHaveBeenCalled()

      fetchMock.mockResolvedValueOnce(jsonResponse({ connection: {} }))
      await act(async () => {
        await result.current.mutateAsync({
          provider: "github",
          action: "disconnect",
        })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: verificationQueryKeys.connections(),
      })
    })

    it("invalidates verification data after provider sync and claim delete", async () => {
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")
      const wrapper = createQueryWrapper(queryClient)
      const syncResult = renderHook(() => useRunConnectionSyncMutation(), {
        wrapper,
      })
      const deleteResult = renderHook(() => useDeleteClaimMutation(), {
        wrapper,
      })

      fetchMock.mockResolvedValueOnce(jsonResponse(syncPayload))
      await act(async () => {
        await syncResult.result.current.mutateAsync("github")
      })

      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
      await act(async () => {
        await deleteResult.result.current.mutateAsync("claim-1")
      })

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: verificationQueryKeys.summary(),
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: verificationQueryKeys.claimUploadsRoot(),
      })
      expect(invalidateSpy).toHaveBeenCalledTimes(10)
    })
  })
})
