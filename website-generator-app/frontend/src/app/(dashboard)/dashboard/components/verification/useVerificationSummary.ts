"use client"

import { useCallback } from "react"

import type { VerificationSummaryDTO } from "@/types/verification-summary"
import { useVerificationSummaryQuery } from "./verification.query"

interface UseVerificationSummaryReturn {
  summary: VerificationSummaryDTO | null
  isLoading: boolean
  isInitialLoading: boolean
  error: string | null
  refetch: () => void
}

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

const useVerificationSummary = (): UseVerificationSummaryReturn => {
  const {
    data,
    error,
    isError,
    isFetching,
    isPending,
    refetch: refetchSummary,
  } = useVerificationSummaryQuery()
  const refetch = useCallback(() => {
    void refetchSummary()
  }, [refetchSummary])

  return {
    summary: data ?? null,
    isLoading: isFetching,
    isInitialLoading: isPending,
    error: isError
      ? getErrorMessage(error, "Failed to fetch verification summary")
      : null,
    refetch,
  }
}

export default useVerificationSummary
