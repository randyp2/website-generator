"use client";

import { useCallback, useState } from "react";

import { useConnectionActionMutation } from "./verification.query";
import type {
    ConnectionActionInFlight,
    ConnectionActionType,
    ConnectionProvider,
} from "./verification.types";

interface UseConnectionActionsReturn {
    connectionActionInFlight: ConnectionActionInFlight | null;
    connectionActionError: string | null;
    connectProvider: (provider: ConnectionProvider) => Promise<void>;
    disconnectProvider: (provider: ConnectionProvider) => Promise<void>;
}

const DEFAULT_ACTION_ERROR_MESSAGE: Record<ConnectionActionType, string> = {
    connect: "Failed to connect provider",
    disconnect: "Failed to disconnect provider",
};
const CONNECT_REDIRECT_MISSING_ERROR =
    "Failed to connect provider: authorization URL is missing";

const useConnectionActions = (): UseConnectionActionsReturn => {
    const [connectionActionInFlight, setConnectionActionInFlight] =
        useState<ConnectionActionInFlight | null>(null);
    const [connectionActionError, setConnectionActionError] = useState<
        string | null
    >(null);
    const {
        isPending: isConnectionActionPending,
        mutateAsync: runConnectionAction,
    } = useConnectionActionMutation();

    const runAction = useCallback(
        async (
            provider: ConnectionProvider,
            action: ConnectionActionType,
        ): Promise<void> => {
            if (connectionActionInFlight || isConnectionActionPending) return;

            setConnectionActionInFlight({ provider, action });
            setConnectionActionError(null);

            try {
                const result = await runConnectionAction({
                    provider,
                    action,
                });

                if (action === "connect") {
                    if (!result.authorizationUrl) {
                        throw new Error(CONNECT_REDIRECT_MISSING_ERROR);
                    }

                    // Navigate to login screen
                    window.location.assign(result.authorizationUrl);
                    return;
                }
            } catch (error) {
                setConnectionActionError(
                    error instanceof Error
                        ? error.message
                        : DEFAULT_ACTION_ERROR_MESSAGE[action],
                );
            } finally {
                setConnectionActionInFlight(null);
            }
        },
        [connectionActionInFlight, isConnectionActionPending, runConnectionAction],
    );

    const connectProvider = useCallback(
        async (provider: ConnectionProvider): Promise<void> =>
            runAction(provider, "connect"),
        [runAction],
    );

    const disconnectProvider = useCallback(
        async (provider: ConnectionProvider): Promise<void> =>
            runAction(provider, "disconnect"),
        [runAction],
    );

    return {
        connectionActionInFlight,
        connectionActionError,
        connectProvider,
        disconnectProvider,
    };
};

export default useConnectionActions;
