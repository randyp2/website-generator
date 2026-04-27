"use client"

import { useCallback, useEffect, useState } from "react"

import type { ClaimDTO } from "@/types/claim"

interface UseClaimsReturn {
  claims: ClaimDTO[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const useClaims = (): UseClaimsReturn => {
  const [claims, setClaims] = useState<ClaimDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClaims = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/profile/resume-verification/claims")

      if (!res.ok) {
        throw new Error("Failed to fetch claims")
      }

      const data: ClaimDTO[] = await res.json()
      setClaims(data)
    } catch (err) {
      console.error("Error fetching claims:", err)
      setError(
        err instanceof Error ? err.message : "Failed to fetch claims",
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClaims()
  }, [fetchClaims])

  return { claims, isLoading, error, refetch: fetchClaims }
}

export default useClaims
