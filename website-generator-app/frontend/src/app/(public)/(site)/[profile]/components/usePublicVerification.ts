"use client";

import { useQuery } from "@tanstack/react-query";

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

interface UsePublicVerificationIdentityOptions {
    profileId: string | null;
    username: string | null;
}

export const publicVerificationQueryKeys = {
    all: ["public-verification"] as const,
    profile: (username: string) =>
        [...publicVerificationQueryKeys.all, "profile", username] as const,
    summary: (username: string) =>
        [...publicVerificationQueryKeys.profile(username), "summary"] as const,
    claims: (username: string) =>
        [...publicVerificationQueryKeys.profile(username), "claims"] as const,
    evidence: (username: string) =>
        [...publicVerificationQueryKeys.profile(username), "evidence"] as const,
    connections: (username: string) =>
        [...publicVerificationQueryKeys.profile(username), "connections"] as const,
    summaryByProfileId: (profileId: string, username: string | null) =>
        [
            ...publicVerificationQueryKeys.all,
            "profile-id",
            profileId,
            "summary",
            { username },
        ] as const,
};

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
            evidenceDepth: item.evidenceDepth,
            reason: item.reason,
            sourceFile: item.sourceFile,
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
            evidenceDepth: link.evidenceDepth,
            reason: link.reason,
            sourceFile: link.sourceFile,
        })),
    };
};

const readPublicVerificationJson = async <T>(
    response: Response,
    fallbackMessage: string,
): Promise<T> => {
    if (response.ok) {
        return (await response.json()) as T;
    }

    let message = fallbackMessage;
    try {
        const payload = (await response.json()) as {
            error?: unknown;
            message?: unknown;
        };
        if (typeof payload.error === "string") {
            message = payload.error;
        } else if (typeof payload.message === "string") {
            message = payload.message;
        }
    } catch {
        const text = await response.text().catch(() => "");
        if (text) message = text;
    }

    throw new Error(message);
};

const getQueryErrorMessage = (
    error: unknown,
    fallbackMessage: string,
): string | null => {
    if (!error) return null;
    return error instanceof Error ? error.message : fallbackMessage;
};

const fetchPublicVerificationSummary = async (
    username: string,
): Promise<VerificationSummaryDTO> => {
    const response = await fetch(
        `/api/public/profile/${encodeURIComponent(username)}/verification/summary`,
        { cache: "no-store" },
    );

    return readPublicVerificationJson<PublicVerificationSummaryDTO>(
        response,
        "Failed to fetch verification summary",
    );
};

const fetchPublicVerificationSummaryByIdentity = async ({
    profileId,
    username,
}: UsePublicVerificationIdentityOptions): Promise<VerificationSummaryDTO> => {
    if (profileId) {
        const response = await fetch(
            `/api/public/profile/by-id/${encodeURIComponent(profileId)}/verification/summary`,
            { cache: "no-store" },
        );

        if (response.ok) {
            return (await response.json()) as PublicVerificationSummaryDTO;
        }

        if (response.status !== 404 || !username) {
            return readPublicVerificationJson<PublicVerificationSummaryDTO>(
                response,
                "Failed to fetch verification summary",
            );
        }
    }

    if (username) {
        return fetchPublicVerificationSummary(username);
    }

    throw new Error("Verification summary owner is missing");
};

const fetchPublicClaims = async (username: string): Promise<ClaimDTO[]> => {
    const response = await fetch(
        `/api/public/profile/${encodeURIComponent(username)}/verification/claims`,
        { cache: "no-store" },
    );

    const data = await readPublicVerificationJson<PublicClaimDTO[]>(
        response,
        "Failed to fetch claims",
    );

    return data.map(toClaimDTO);
};

const fetchPublicEvidence = async (username: string): Promise<EvidenceDTO[]> => {
    const response = await fetch(
        `/api/public/profile/${encodeURIComponent(username)}/verification/evidence`,
        { cache: "no-store" },
    );

    const data =
        await readPublicVerificationJson<PublicEvidenceListResponseDTO>(
            response,
            "Failed to fetch evidence",
        );
    const items = Array.isArray(data.items) ? data.items : [];

    return items.map(toEvidenceDTO);
};

const fetchPublicConnections = async (
    username: string,
): Promise<ConnectionData[]> => {
    const response = await fetch(
        `/api/public/profile/${encodeURIComponent(username)}/verification/connections`,
        { cache: "no-store" },
    );

    const data = await readPublicVerificationJson<PublicConnectedAccountDTO[]>(
        response,
        "Failed to fetch connections",
    );

    return mergeDefaultsWithConnected(data);
};

const defaultConnections = (): ConnectionData[] =>
    PROVIDER_ORDER.map((provider) => buildDefaultConnection(provider));

export const usePublicVerificationSummary = (
    username: string,
): UsePublicVerificationSummaryReturn => {
    const query = useQuery({
        queryKey: publicVerificationQueryKeys.summary(username),
        queryFn: () => fetchPublicVerificationSummary(username),
        enabled: username.length > 0,
    });

    return {
        summary: query.data ?? null,
        isLoading: query.isPending,
        error: getQueryErrorMessage(
            query.error,
            "Failed to fetch verification summary",
        ),
        refetch: () => {
            void query.refetch();
        },
    };
};

export const usePublicVerificationSummaryByIdentity = ({
    profileId,
    username,
}: UsePublicVerificationIdentityOptions): UsePublicVerificationSummaryReturn => {
    const queryKey = profileId
        ? publicVerificationQueryKeys.summaryByProfileId(profileId, username)
        : publicVerificationQueryKeys.summary(username ?? "");
    const query = useQuery({
        queryKey,
        queryFn: () =>
            fetchPublicVerificationSummaryByIdentity({ profileId, username }),
        enabled: Boolean(profileId || username),
    });

    return {
        summary: query.data ?? null,
        isLoading: query.isPending,
        error: getQueryErrorMessage(
            query.error,
            "Failed to fetch verification summary",
        ),
        refetch: () => {
            void query.refetch();
        },
    };
};

export const usePublicClaims = (
    username: string,
): UsePublicClaimsReturn => {
    const query = useQuery({
        queryKey: publicVerificationQueryKeys.claims(username),
        queryFn: () => fetchPublicClaims(username),
        enabled: username.length > 0,
    });

    return {
        claims: query.data ?? [],
        isLoading: query.isPending,
        error: getQueryErrorMessage(query.error, "Failed to fetch claims"),
        refetch: () => {
            void query.refetch();
        },
    };
};

export const usePublicEvidence = (
    username: string,
): UsePublicEvidenceReturn => {
    const query = useQuery({
        queryKey: publicVerificationQueryKeys.evidence(username),
        queryFn: () => fetchPublicEvidence(username),
        enabled: username.length > 0,
    });

    return {
        evidence: query.data ?? [],
        isLoading: query.isPending,
        error: getQueryErrorMessage(query.error, "Failed to fetch evidence"),
        refetch: () => {
            void query.refetch();
        },
    };
};

export const usePublicConnections = (
    username: string,
): UsePublicConnectionsReturn => {
    const query = useQuery({
        queryKey: publicVerificationQueryKeys.connections(username),
        queryFn: () => fetchPublicConnections(username),
        enabled: username.length > 0,
    });

    return {
        connections: query.data ?? defaultConnections(),
        isLoading: query.isPending,
        error: getQueryErrorMessage(
            query.error,
            "Failed to fetch connections",
        ),
        refetch: () => {
            void query.refetch();
        },
    };
};
