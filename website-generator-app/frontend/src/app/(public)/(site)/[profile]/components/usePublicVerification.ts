"use client";

import { useCallback, useEffect, useState } from "react";

import type { ClaimDTO } from "@/types/claim";
import type { ConnectionData, ConnectionProvider, ConnectionStatus, ConnectionSyncStatus } from "@/app/(dashboard)/dashboard/components/verification/verification.types";
import type { EvidenceDTO } from "@/types/evidence";
import type {
    PublicClaimDTO,
    PublicConnectedAccountDTO,
    PublicEvidenceListResponseDTO,
    PublicVerificationSummaryDTO,
} from "@/types/public-verification";
import type { VerificationSummaryDTO } from "@/types/verification-summary";

interface UsePublicVerificationSummaryReturn {
    summary: VerificationSummaryDTO | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

interface UsePublicClaimsReturn {
    claims: ClaimDTO[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

interface UsePublicEvidenceReturn {
    evidence: EvidenceDTO[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

interface UsePublicConnectionsReturn {
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
        defaultPermissionScope: "Public verification snapshot",
    },
    github: {
        displayName: "GitHub",
        potentialPoints: 25,
        defaultPermissionScope: "Public verification snapshot",
    },
    website: {
        displayName: "Personal Website",
        potentialPoints: 10,
        defaultPermissionScope: "Public verification snapshot",
    },
    other: {
        displayName: "Other Source",
        potentialPoints: 8,
        defaultPermissionScope: "Public verification snapshot",
    },
};

const isConnectionProvider = (value: string): value is ConnectionProvider =>
    value === "linkedin"
    || value === "github"
    || value === "website"
    || value === "other";

const isConnectionStatus = (value: string): value is ConnectionStatus =>
    value === "connected"
    || value === "disconnected"
    || value === "expired"
    || value === "pending";

const isConnectionSyncStatus = (value: string): value is ConnectionSyncStatus =>
    value === "never"
    || value === "running"
    || value === "success"
    || value === "failed";

const toSupportedProvider = (provider: string): ConnectionProvider => {
    const normalized = provider.trim().toLowerCase();
    return isConnectionProvider(normalized) ? normalized : "other";
};

const toSupportedStatus = (status: string): ConnectionStatus => {
    const normalized = status.trim().toLowerCase();
    return isConnectionStatus(normalized) ? normalized : "pending";
};

const toSupportedSyncStatus = (
    status: string | null | undefined,
): ConnectionSyncStatus => {
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
    lastSyncCompletedAt: null,
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
    account: PublicConnectedAccountDTO,
): ConnectionData => {
    const provider = toSupportedProvider(account.provider);
    const status = toSupportedStatus(account.status);

    return {
        provider,
        displayName: PROVIDER_META[provider].displayName,
        status,
        connectedAt: account.connectedAt,
        lastSyncedAt: account.lastSyncedAt,
        lastSyncCompletedAt: account.lastSyncCompletedAt,
        lastSyncStatus: toSupportedSyncStatus(account.lastSyncStatus),
        lastSyncError: null,
        lastSyncImportedCount: account.lastSyncImportedCount ?? 0,
        lastSyncLinkedCount: account.lastSyncLinkedCount ?? 0,
        profileUrl: null,
        endorsementCount: account.lastSyncImportedCount ?? 0,
        potentialPoints: PROVIDER_META[provider].potentialPoints,
        permissionScope: PROVIDER_META[provider].defaultPermissionScope,
    };
};

const mergeDefaultsWithConnected = (
    accounts: PublicConnectedAccountDTO[],
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

const toClaimDTO = (claim: PublicClaimDTO): ClaimDTO => ({
    id: claim.id,
    profileId: "",
    resumeVerificationId: null,
    claimType: claim.claimType,
    rawValue: claim.rawValue,
    canonicalSkillId: claim.canonicalSkillId,
    canonicalSkillName: claim.canonicalSkillName,
    source: claim.source,
    confidence: claim.confidence,
    status: claim.status,
    evidenceSummary: {
        claimId: claim.evidenceSummary.claimId,
        linkedEvidenceCount: claim.evidenceSummary.linkedEvidenceCount ?? 0,
        linkedEvidence: claim.evidenceSummary.linkedEvidence.map((item) => ({
            evidenceId: item.evidenceId,
            provider: item.provider,
            externalId: item.externalId,
            evidenceType: item.evidenceType,
            title: item.title,
            sourceUrl: item.sourceUrl,
            capturedAt: item.capturedAt,
            linkType: item.linkType,
            linkConfidence: item.linkConfidence ?? 0,
            reason: item.reason,
        })),
    },
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
});

const toEvidenceDTO = (item: PublicEvidenceListResponseDTO["items"][number]): EvidenceDTO => {
    const fallbackDate =
        item.capturedAt
        ?? item.occurredAt
        ?? item.updatedAt
        ?? item.createdAt
        ?? new Date().toISOString();

    return {
        id: item.id,
        profileId: "",
        provider: item.provider,
        externalId: item.externalId,
        evidenceType: item.evidenceType,
        title: item.title,
        description: item.description,
        sourceUrl: item.sourceUrl,
        occurredAt: item.occurredAt,
        capturedAt: item.capturedAt ?? fallbackDate,
        metadata: item.metadata ?? {},
        createdAt: item.createdAt ?? fallbackDate,
        updatedAt: item.updatedAt ?? fallbackDate,
        links: item.links.map((link) => ({
            claimId: link.claimId,
            linkType: link.linkType,
            linkConfidence: link.linkConfidence ?? 0,
            reason: link.reason,
        })),
    };
};

export const usePublicVerificationSummary = (
    username: string,
): UsePublicVerificationSummaryReturn => {
    const [summary, setSummary] = useState<VerificationSummaryDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        if (!username) {
            setSummary(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/public/profile/${encodeURIComponent(username)}/verification/summary`,
                { cache: "no-store" },
            );

            if (!response.ok) {
                throw new Error("Failed to fetch verification summary");
            }

            const data = (await response.json()) as PublicVerificationSummaryDTO;
            setSummary(data);
        } catch (err) {
            console.error("Error fetching public verification summary:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch verification summary",
            );
            setSummary(null);
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return { summary, isLoading, error, refetch: fetchSummary };
};

export const usePublicClaims = (
    username: string,
): UsePublicClaimsReturn => {
    const [claims, setClaims] = useState<ClaimDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClaims = useCallback(async () => {
        if (!username) {
            setClaims([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/public/profile/${encodeURIComponent(username)}/verification/claims`,
                { cache: "no-store" },
            );

            if (!response.ok) {
                throw new Error("Failed to fetch claims");
            }

            const data = (await response.json()) as PublicClaimDTO[];
            setClaims(data.map(toClaimDTO));
        } catch (err) {
            console.error("Error fetching public verification claims:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch claims");
            setClaims([]);
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchClaims();
    }, [fetchClaims]);

    return { claims, isLoading, error, refetch: fetchClaims };
};

export const usePublicEvidence = (
    username: string,
): UsePublicEvidenceReturn => {
    const [evidence, setEvidence] = useState<EvidenceDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvidence = useCallback(async () => {
        if (!username) {
            setEvidence([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/public/profile/${encodeURIComponent(username)}/verification/evidence`,
                { cache: "no-store" },
            );

            if (!response.ok) {
                throw new Error("Failed to fetch evidence");
            }

            const data = (await response.json()) as PublicEvidenceListResponseDTO;
            const items = Array.isArray(data.items) ? data.items : [];
            setEvidence(items.map(toEvidenceDTO));
        } catch (err) {
            console.error("Error fetching public verification evidence:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch evidence",
            );
            setEvidence([]);
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchEvidence();
    }, [fetchEvidence]);

    return { evidence, isLoading, error, refetch: fetchEvidence };
};

export const usePublicConnections = (
    username: string,
): UsePublicConnectionsReturn => {
    const [connections, setConnections] = useState<ConnectionData[]>(
        PROVIDER_ORDER.map((provider) => buildDefaultConnection(provider)),
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConnections = useCallback(async () => {
        if (!username) {
            setConnections(PROVIDER_ORDER.map((provider) => buildDefaultConnection(provider)));
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/public/profile/${encodeURIComponent(username)}/verification/connections`,
                { cache: "no-store" },
            );

            if (!response.ok) {
                throw new Error("Failed to fetch connections");
            }

            const data = (await response.json()) as PublicConnectedAccountDTO[];
            setConnections(mergeDefaultsWithConnected(data));
        } catch (err) {
            console.error("Error fetching public verification connections:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch connections",
            );
            setConnections(PROVIDER_ORDER.map((provider) => buildDefaultConnection(provider)));
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    return { connections, isLoading, error, refetch: fetchConnections };
};
