"use client"

import { useCallback } from "react"

import type { EvidenceDTO } from "@/types/evidence"
import { useVerificationEvidenceQuery } from "./verification.query"

interface UseEvidenceReturn {
  evidence: EvidenceDTO[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

const useEvidence = (): UseEvidenceReturn => {
  const {
    data,
    error,
    isError,
    isFetching,
    refetch: refetchEvidence,
  } = useVerificationEvidenceQuery()
  const refetch = useCallback(() => {
    void refetchEvidence()
  }, [refetchEvidence])

  return {
    evidence: data ?? [],
    isLoading: isFetching,
    error: isError ? getErrorMessage(error, "Failed to fetch evidence") : null,
    refetch,
  }
}

export default useEvidence
