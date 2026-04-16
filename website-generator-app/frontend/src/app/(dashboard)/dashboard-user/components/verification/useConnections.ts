"use client";

import { useCallback, useEffect, useState } from "react";

import type { ConnectedAccountDTO } from "@/types/connection";

import type {
    ConnectionData,
    ConnectionProvider,
    ConnectionSyncStatus,
    ConnectionStatus,
} from "./verification.types";

interface UseConnectionsReturn {
    connections: ConnectionData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

const PROVIDER_ORDER: ConnectionProvider[] = [
    "linkedin",
    "github",
    "website",
    "other",
];

const PROVIDER_META: Record<
    ConnectionProvider,
    {
        displayName: string;
        potentialPoints: number;
        defaultPermissionScope: string;
    }
> = {
    linkedin: {
        displayName: "LinkedIn",
        potentialPoints: 18,
        defaultPermissionScope: "Read profile and public professional signals",
    },
    github: {
        displayName: "GitHub",
        potentialPoints: 25,
        defaultPermissionScope: "Read profile and selected repository metadata",
    },
    website: {
        displayName: "Personal Website",
        potentialPoints: 10,
        defaultPermissionScope: "Read configured public site evidence",
    },
    other: {
        displayName: "Other Source",
        potentialPoints: 8,
        defaultPermissionScope: "Read selected external evidence source",
    },
};

const isConnectionProvider = (value: string): value is ConnectionProvider =>
    value === "linkedin" ||
    value === "github" ||
    value === "website" ||
    value === "other";

const isConnectionStatus = (value: string): value is ConnectionStatus =>
    value === "connected" ||
    value === "disconnected" ||
    value === "expired" ||
    value === "pending";

const isConnectionSyncStatus = (value: string): value is ConnectionSyncStatus =>
    value === "never" ||
    value === "running" ||
    value === "success" ||
    value === "failed";

const toSupportedProvider = (provider: string): ConnectionProvider => {
    const normalized = provider.trim().toLowerCase();
    return isConnectionProvider(normalized) ? normalized : "other";
};

const toSupportedStatus = (status: string): ConnectionStatus => {
    const normalized = status.trim().toLowerCase();
    return isConnectionStatus(normalized) ? normalized : "pending";
};

const toSupportedSyncStatus = (status: string | null | undefined): ConnectionSyncStatus => {
    const normalized = status?.trim().toLowerCase();
    return normalized && isConnectionSyncStatus(normalized)
        ? normalized
        : "never";
};

const buildDefaultConnection = (
    provider: ConnectionProvider,
): ConnectionData => ({
    provider,
    displayName: PROVIDER_META[provider].displayName,
    status: "disconnected",
    connectedAt: null,
    lastSyncedAt: null,
    lastSyncStatus: "never",
    lastSyncError: null,
    lastSyncImportedCount: 0,
    lastSyncLinkedCount: 0,
    profileUrl: null,
    endorsementCount: 0,
    potentialPoints: PROVIDER_META[provider].potentialPoints,
    permissionScope: PROVIDER_META[provider].defaultPermissionScope,
});

const mapAccountToConnection = (
    account: ConnectedAccountDTO,
): ConnectionData => {
    const provider = toSupportedProvider(account.provider);
    const status = toSupportedStatus(account.status);
    const scopeLabel =
        account.scopes.length > 0
            ? account.scopes.join(", ")
            : PROVIDER_META[provider].defaultPermissionScope;

    return {
        provider,
        displayName: PROVIDER_META[provider].displayName,
        status,
        connectedAt: status === "connected" ? account.createdAt : null,
        lastSyncedAt: account.lastSyncedAt,
        lastSyncStatus: toSupportedSyncStatus(account.lastSyncStatus),
        lastSyncError: account.lastSyncError,
        lastSyncImportedCount: account.lastSyncImportedCount ?? 0,
        lastSyncLinkedCount: account.lastSyncLinkedCount ?? 0,
        profileUrl: null,
        endorsementCount: account.lastSyncImportedCount ?? 0,
        potentialPoints: PROVIDER_META[provider].potentialPoints,
        permissionScope: scopeLabel,
    };
};

const mergeDefaultsWithConnected = (
    accounts: ConnectedAccountDTO[],
): ConnectionData[] => {
    const byProvider = new Map<ConnectionProvider, ConnectionData>(
        PROVIDER_ORDER.map((provider) => [
            provider,
            buildDefaultConnection(provider),
        ]),
    );

    accounts.forEach((account) => {
        const mapped = mapAccountToConnection(account);
        byProvider.set(mapped.provider, mapped);
    });

    return PROVIDER_ORDER.map(
        (provider) =>
            byProvider.get(provider) ?? buildDefaultConnection(provider),
    );
};

const useConnections = (): UseConnectionsReturn => {
    const [connections, setConnections] = useState<ConnectionData[]>(
        PROVIDER_ORDER.map((provider) => buildDefaultConnection(provider)),
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConnections = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res: Response = await fetch(
                "/api/profile/resume-verification/connections",
                {
                    cache: "no-store",
                },
            );

            if (!res.ok) {
                throw new Error("Failed to fetch connections");
            }

            const data: ConnectedAccountDTO[] = await res.json();
            setConnections(mergeDefaultsWithConnected(data));
        } catch (err) {
            console.error("Error fetching connections:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch connections",
            );
            setConnections(
                PROVIDER_ORDER.map((provider) =>
                    buildDefaultConnection(provider),
                ),
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    return { connections, isLoading, error, refetch: fetchConnections };
};

export default useConnections;
