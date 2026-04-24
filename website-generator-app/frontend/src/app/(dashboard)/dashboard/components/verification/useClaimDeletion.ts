"use client"

import { useCallback, useState } from "react"

import { deleteClaimRequest } from "./verification.api"

interface UseClaimDeletionParams {
  onSuccess: () => void
}

interface UseClaimDeletionReturn {
  isDeletingClaim: boolean
  deleteError: string | null
  clearDeleteError: () => void
  handleDeleteClaim: (claimId: string) => Promise<void>
}

const useClaimDeletion = ({
  onSuccess,
}: UseClaimDeletionParams): UseClaimDeletionReturn => {
  const [isDeletingClaim, setIsDeletingClaim] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const clearDeleteError = useCallback((): void => {
    setDeleteError(null)
  }, [])

  const handleDeleteClaim = useCallback(async (claimId: string): Promise<void> => {
    setIsDeletingClaim(true)
    setDeleteError(null)

    try {
      await deleteClaimRequest(claimId)
      onSuccess()
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete claim",
      )
    } finally {
      setIsDeletingClaim(false)
    }
  }, [onSuccess])

  return {
    isDeletingClaim,
    deleteError,
    clearDeleteError,
    handleDeleteClaim,
  }
}

export default useClaimDeletion
