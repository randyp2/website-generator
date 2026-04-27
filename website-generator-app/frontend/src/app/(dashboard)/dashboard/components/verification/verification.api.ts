"use client";

import type {
    ConnectionActionType,
    ConnectionProvider,
} from "./verification.types";
import type {
    ConnectProviderResponseDTO,
    DisconnectProviderResponseDTO,
    SyncProviderResponseDTO,
} from "@/types/connection";

interface ErrorResponseBody {
    error?: unknown;
}

const CONNECTIONS_BASE_PATH = "/api/profile/resume-verification/connections";
const CLAIMS_BASE_PATH = "/api/profile/resume-verification/claims";

const DEFAULT_ACTION_ERROR_MESSAGE: Record<ConnectionActionType, string> = {
    connect: "Failed to connect provider",
    disconnect: "Failed to disconnect provider",
};

const CONNECT_REDIRECT_MISSING_ERROR =
    "Failed to connect provider: authorization URL is missing";

export interface ConnectionActionResult {
    authorizationUrl: string | null;
}

const DEFAULT_SYNC_ERROR_MESSAGE = "Failed to sync provider";

export const resolveErrorMessage = async (
    response: Response,
    fallback: string,
): Promise<string> => {
    try {
        const body: ErrorResponseBody = await response.json();
        return typeof body.error === "string" ? body.error : fallback;
    } catch {
        return fallback;
    }
};

export const runConnectionActionRequest = async (
    provider: ConnectionProvider,
    action: ConnectionActionType,
): Promise<ConnectionActionResult> => {
    const method = action === "connect" ? "POST" : "DELETE";
    const endpoint =
        action === "connect"
            ? `${CONNECTIONS_BASE_PATH}/${provider}/connect`
            : `${CONNECTIONS_BASE_PATH}/${provider}`;

    const response: Response = await fetch(endpoint, { method });

    if (!response.ok) {
        const message = await resolveErrorMessage(
            response,
            DEFAULT_ACTION_ERROR_MESSAGE[action],
        );
        throw new Error(message);
    }

    if (action === "connect") {
        const payload = (await response.json()) as ConnectProviderResponseDTO;
        if (
            payload.authorizationUrl !== null &&
            typeof payload.authorizationUrl !== "string"
        ) {
            throw new Error(CONNECT_REDIRECT_MISSING_ERROR);
        }

        return { authorizationUrl: payload.authorizationUrl };
    }

    (await response.json()) as DisconnectProviderResponseDTO;
    return { authorizationUrl: null };
};

export const runConnectionSyncRequest = async (
    provider: ConnectionProvider,
): Promise<SyncProviderResponseDTO> => {
    const response: Response = await fetch(
        `${CONNECTIONS_BASE_PATH}/${provider}/sync`,
        { method: "POST" },
    );

    if (!response.ok) {
        const message = await resolveErrorMessage(
            response,
            DEFAULT_SYNC_ERROR_MESSAGE,
        );
        throw new Error(message);
    }

    const payload = (await response.json()) as SyncProviderResponseDTO;
    if (
        typeof payload.syncStatus === "string"
        && payload.syncStatus.toLowerCase() === "failed"
    ) {
        throw new Error(payload.error ?? DEFAULT_SYNC_ERROR_MESSAGE);
    }

    return payload;
};

export const deleteClaimRequest = async (
    claimId: string,
): Promise<Response> => {
    const response = await fetch(`${CLAIMS_BASE_PATH}/${claimId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const message = await resolveErrorMessage(
            response,
            "Failed to delete claim",
        );
        throw new Error(message);
    }

    return response;
};
