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
    /** Restores the version into the editor AND pins it to the public site. */
    makeLive: (versionId: string) => Promise<boolean>;
    isMakingLive: boolean;
}

export function useVersions(portfolioId: string | null): UseVersionsReturn {
    const [versions, setVersions] = useState<Version[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isActivating, setIsActivating] = useState(false);
    const [isMakingLive, setIsMakingLive] = useState(false);

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

    const makeLive = useCallback(
        async (versionId: string): Promise<boolean> => {
            if (!portfolioId) return false;

            const wasActive = versions.find((v) => v.id === versionId)?.is_active;

            // Optimistic: reflect the end state immediately; on any failure we
            // refetch rather than restore a snapshot, because a partial failure
            // (restored but not pinned) leaves server state neither old nor new
            setVersions((prev) =>
                prev.map((v) => ({
                    ...v,
                    is_active: v.id === versionId,
                    is_published: v.id === versionId,
                })),
            );
            setIsMakingLive(true);

            try {
                // Never publish blind: restore into the editor first so what's
                // live is always something the user can see, then pin it
                if (!wasActive) {
                    const activated = await fetch(
                        `/api/portfolio/${portfolioId}/versions/${versionId}/activate`,
                        { method: "POST" },
                    );
                    if (!activated.ok) {
                        await fetchVersions();
                        return false;
                    }
                }

                const pinned = await fetch(
                    `/api/portfolio/${portfolioId}/versions/publish-current`,
                    { method: "POST" },
                );
                if (!pinned.ok) {
                    await fetchVersions();
                    return false;
                }

                return true;
            } catch (err) {
                console.error("Make live error:", err);
                await fetchVersions();
                return false;
            } finally {
                setIsMakingLive(false);
            }
        },
        [portfolioId, versions, fetchVersions],
    );

    return {
        versions,
        isLoading,
        error,
        refetch: fetchVersions,
        activateVersion,
        isActivating,
        makeLive,
        isMakingLive,
    };
}
