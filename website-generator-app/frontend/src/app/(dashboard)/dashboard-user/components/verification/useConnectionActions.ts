"use client"

import { useCallback, useState } from "react"

import {
  runConnectionActionRequest,
} from "./verification.api"
import type {
  ConnectionActionInFlight,
  ConnectionActionType,
  ConnectionProvider,
} from "./verification.types"

interface UseConnectionActionsParams {
  refetchConnections: () => void | Promise<void>
}

interface UseConnectionActionsReturn {
  connectionActionInFlight: ConnectionActionInFlight | null
  connectionActionError: string | null
  connectProvider: (provider: ConnectionProvider) => Promise<void>
  disconnectProvider: (provider: ConnectionProvider) => Promise<void>
}

const DEFAULT_ACTION_ERROR_MESSAGE: Record<ConnectionActionType, string> = {
  connect: "Failed to connect provider",
  disconnect: "Failed to disconnect provider",
}

const useConnectionActions = ({
  refetchConnections,
}: UseConnectionActionsParams): UseConnectionActionsReturn => {
  const [connectionActionInFlight, setConnectionActionInFlight] =
    useState<ConnectionActionInFlight | null>(null)
  const [connectionActionError, setConnectionActionError] =
    useState<string | null>(null)

  const runAction = useCallback(async (
    provider: ConnectionProvider,
    action: ConnectionActionType,
  ): Promise<void> => {
    if (connectionActionInFlight) return

    setConnectionActionInFlight({ provider, action })
    setConnectionActionError(null)

    try {
      await runConnectionActionRequest(provider, action)
      await refetchConnections()
    } catch (error) {
      setConnectionActionError(
        error instanceof Error
          ? error.message
          : DEFAULT_ACTION_ERROR_MESSAGE[action],
      )
    } finally {
      setConnectionActionInFlight(null)
    }
  }, [connectionActionInFlight, refetchConnections])

  const connectProvider = useCallback(
    async (provider: ConnectionProvider): Promise<void> =>
      runAction(provider, "connect"),
    [runAction],
  )

  const disconnectProvider = useCallback(
    async (provider: ConnectionProvider): Promise<void> =>
      runAction(provider, "disconnect"),
    [runAction],
  )

  return {
    connectionActionInFlight,
    connectionActionError,
    connectProvider,
    disconnectProvider,
  }
}

export default useConnectionActions
