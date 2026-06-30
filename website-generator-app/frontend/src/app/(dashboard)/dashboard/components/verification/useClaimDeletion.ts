"use client"

import { useCallback } from "react"

import { useDeleteClaimMutation } from "./verification.query"

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
  const {
    error,
    isPending,
    mutateAsync: deleteClaim,
    reset,
  } = useDeleteClaimMutation()

  const clearDeleteError = useCallback((): void => {
    reset()
  }, [reset])

  const handleDeleteClaim = useCallback(async (claimId: string): Promise<void> => {
    try {
      reset()
      await deleteClaim(claimId)
      onSuccess()
    } catch {
      // The mutation stores the error for UI display.
    }
  }, [deleteClaim, onSuccess, reset])

  return {
    isDeletingClaim: isPending,
    deleteError: error instanceof Error ? error.message : null,
    clearDeleteError,
    handleDeleteClaim,
  }
}

export default useClaimDeletion
