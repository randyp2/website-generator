"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { VerificationSummaryDTO } from "@/types/verification-summary"

interface UseVerificationSummaryReturn {
  summary: VerificationSummaryDTO | null
  isLoading: boolean
  isInitialLoading: boolean
  error: string | null
  refetch: () => void
}

const useVerificationSummary = (): UseVerificationSummaryReturn => {
  const [summary, setSummary] = useState<VerificationSummaryDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedOnceRef = useRef(false)

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/profile/resume-verification/summary", {
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch verification summary")
      }

      const data: VerificationSummaryDTO = await res.json()
      setSummary(data)
    } catch (err) {
      console.error("Error fetching verification summary:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch verification summary",
      )
    } finally {
      hasLoadedOnceRef.current = true
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return {
    summary,
    isLoading,
    isInitialLoading: isLoading && !hasLoadedOnceRef.current,
    error,
    refetch: fetchSummary,
  }
}

export default useVerificationSummary
