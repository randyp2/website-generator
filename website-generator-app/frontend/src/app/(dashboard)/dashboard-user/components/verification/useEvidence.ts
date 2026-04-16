"use client"

import { useCallback, useEffect, useState } from "react"

import type { EvidenceDTO, EvidenceListResponseDTO } from "@/types/evidence"

interface UseEvidenceReturn {
  evidence: EvidenceDTO[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const useEvidence = (): UseEvidenceReturn => {
  const [evidence, setEvidence] = useState<EvidenceDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvidence = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/profile/resume-verification/evidence", {
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch evidence")
      }

      const data: EvidenceListResponseDTO = await res.json()
      setEvidence(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      console.error("Error fetching evidence:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch evidence",
      )
      setEvidence([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvidence()
  }, [fetchEvidence])

  return { evidence, isLoading, error, refetch: fetchEvidence }
}

export default useEvidence
