"use client"

import { useCallback } from "react"

import type { ClaimDTO } from "@/types/claim"
import { useVerificationClaimsQuery } from "./verification.query"

interface UseClaimsReturn {
  claims: ClaimDTO[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

const useClaims = (): UseClaimsReturn => {
  const {
    data,
    error,
    isError,
    isFetching,
    refetch: refetchClaims,
  } = useVerificationClaimsQuery()
  const refetch = useCallback(() => {
    void refetchClaims()
  }, [refetchClaims])

  return {
    claims: data ?? [],
    isLoading: isFetching,
    error: isError ? getErrorMessage(error, "Failed to fetch claims") : null,
    refetch,
  }
}

export default useClaims
