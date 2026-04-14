"use client"

import type {
  ConnectionActionType,
  ConnectionProvider,
} from "./verification.types"

interface ErrorResponseBody {
  error?: unknown
}

const CONNECTIONS_BASE_PATH = "/api/profile/resume-verification/connections"
const CLAIMS_BASE_PATH = "/api/profile/resume-verification/claims"

const DEFAULT_ACTION_ERROR_MESSAGE: Record<ConnectionActionType, string> = {
  connect: "Failed to connect provider",
  disconnect: "Failed to disconnect provider",
}

export const resolveErrorMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  try {
    const body: ErrorResponseBody = await response.json()
    return typeof body.error === "string" ? body.error : fallback
  } catch {
    return fallback
  }
}

export const runConnectionActionRequest = async (
  provider: ConnectionProvider,
  action: ConnectionActionType,
): Promise<Response> => {
  const method = action === "connect" ? "POST" : "DELETE"
  const endpoint = action === "connect"
    ? `${CONNECTIONS_BASE_PATH}/${provider}/connect`
    : `${CONNECTIONS_BASE_PATH}/${provider}`

  const response = await fetch(endpoint, { method })

  if (!response.ok) {
    const message = await resolveErrorMessage(
      response,
      DEFAULT_ACTION_ERROR_MESSAGE[action],
    )
    throw new Error(message)
  }

  return response
}

export const deleteClaimRequest = async (claimId: string): Promise<Response> => {
  const response = await fetch(`${CLAIMS_BASE_PATH}/${claimId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const message = await resolveErrorMessage(response, "Failed to delete claim")
    throw new Error(message)
  }

  return response
}
