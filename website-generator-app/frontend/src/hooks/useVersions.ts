"use client";

import { useCallback, useEffect, useState } from "react";
import { createMockVersions } from "@/lib/mock-portfolios";
import type { Version } from "@/types/version";

interface UseVersionsReturn {
    versions: Version[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    activateVersion: (versionId: string) => Promise<boolean>;
    isActivating: boolean;
}

export function useVersions(portfolioId: string | null): UseVersionsReturn {
    const [versions, setVersions] = useState<Version[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isActivating, setIsActivating] = useState(false);

    const fetchVersions = useCallback(async () => {
        if (!portfolioId) {
            setVersions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await new Promise((resolve) => window.setTimeout(resolve, 250));
            const sortedVersions = createMockVersions(portfolioId).sort(
                (a: Version, b: Version) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
            );
            setVersions(sortedVersions);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to load mock versions";
            setError(message);
            console.error("Fetch versions error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [portfolioId]);

    useEffect(() => {
        void fetchVersions();
    }, [fetchVersions]);

    const activateVersion = useCallback(
        async (versionId: string): Promise<boolean> => {
            if (!portfolioId) return false;

            setIsActivating(true);
            try {
                await new Promise((resolve) => window.setTimeout(resolve, 300));
                setVersions((prev) =>
                    prev.map((version) => ({
                        ...version,
                        is_active: version.id === versionId,
                    })),
                );
                return true;
            } catch (err) {
                console.error("Activate version error:", err);
                return false;
            } finally {
                setIsActivating(false);
            }
        },
        [portfolioId],
    );

    return {
        versions,
        isLoading,
        error,
        refetch: fetchVersions,
        activateVersion,
        isActivating,
    };
}
