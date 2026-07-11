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

            setIsMakingLive(true);
            try {
                // Never publish blind: restore into the editor first so what's
                // live is always something the user can see, then pin it
                const target = versions.find((v) => v.id === versionId);
                if (!target?.is_active) {
                    const activated = await fetch(
                        `/api/portfolio/${portfolioId}/versions/${versionId}/activate`,
                        { method: "POST" },
                    );
                    if (!activated.ok) return false;
                }

                const pinned = await fetch(
                    `/api/portfolio/${portfolioId}/versions/publish-current`,
                    { method: "POST" },
                );
                if (!pinned.ok) return false;

                setVersions((prev) =>
                    prev.map((v) => ({
                        ...v,
                        is_active: v.id === versionId,
                        is_published: v.id === versionId,
                    })),
                );
                return true;
            } catch (err) {
                console.error("Make live error:", err);
                return false;
            } finally {
                setIsMakingLive(false);
            }
        },
        [portfolioId, versions],
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
