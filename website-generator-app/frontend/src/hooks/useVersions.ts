"use client";

import { useState, useEffect, useCallback } from "react";
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
            const response = await fetch(`/api/portfolio/${portfolioId}/versions`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error ?? "Failed to fetch versions");
            }

            // Sort oldest to newest for timeline display (oldest at top)
            const sortedVersions = (data.versions ?? []).sort(
                (a: Version, b: Version) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            setVersions(sortedVersions);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch versions";
            setError(message);
            console.error("Fetch versions error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [portfolioId]);

    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);

    const activateVersion = useCallback(
        async (versionId: string): Promise<boolean> => {
            if (!portfolioId) return false;

            setIsActivating(true);
            try {
                const response = await fetch(
                    `/api/portfolio/${portfolioId}/versions/${versionId}/activate`,
                    { method: "POST" }
                );

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data?.error ?? "Failed to activate version");
                }

                // Update local state to reflect the new active version
                setVersions((prev) =>
                    prev.map((v) => ({
                        ...v,
                        is_active: v.id === versionId,
                    }))
                );

                return true;
            } catch (err) {
                console.error("Activate version error:", err);
                return false;
            } finally {
                setIsActivating(false);
            }
        },
        [portfolioId]
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
