"use client";

import { useCallback, useEffect, useState } from "react";

interface PublishStateResponse {
    status?: string | null;
    activeVersionId?: string | null;
    publishedVersionId?: string | null;
}

interface UsePublishStateResult {
    /** True when the portfolio is live on a public URL. */
    isPublished: boolean;
    /** True when the editor's version differs from the one visitors see. */
    hasUnpublishedChanges: boolean;
    isPublishing: boolean;
    /** Re-reads publish state from the backend (call after builds/restores). */
    refresh: () => Promise<void>;
    /** Pins the current editor version to the public site. */
    publishChanges: () => Promise<boolean>;
}

/**
 * Tracks whether a published portfolio has editor changes that visitors
 * can't see yet, and exposes the one-click publish that pins them live.
 * Derived entirely from activeVersionId vs publishedVersionId, so it needs
 * no extra bookkeeping: any build or restore that moves the active version
 * shows the chip after a refresh, and publishing clears it.
 */
export const usePublishState = (
    portfolioId: string | null,
): UsePublishStateResult => {
    const [status, setStatus] = useState<string | null>(null);
    const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
    const [publishedVersionId, setPublishedVersionId] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    const refresh = useCallback(async (): Promise<void> => {
        if (!portfolioId) return;

        try {
            const res = await fetch(`/api/portfolio/${portfolioId}/load`);
            if (!res.ok) return;

            const data = (await res.json()) as PublishStateResponse;
            setStatus(data.status ?? null);
            setActiveVersionId(data.activeVersionId ?? null);
            setPublishedVersionId(data.publishedVersionId ?? null);
        } catch {
            // Best-effort: stale chip state is harmless and self-corrects
        }
    }, [portfolioId]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const publishChanges = useCallback(async (): Promise<boolean> => {
        if (!portfolioId || isPublishing) return false;

        setIsPublishing(true);
        try {
            const res = await fetch(
                `/api/portfolio/${portfolioId}/versions/publish-current`,
                { method: "POST" },
            );
            if (!res.ok) return false;

            const data = (await res.json()) as { publishedVersionId?: string };
            if (data.publishedVersionId) {
                setPublishedVersionId(data.publishedVersionId);
            }
            return true;
        } catch {
            return false;
        } finally {
            setIsPublishing(false);
        }
    }, [portfolioId, isPublishing]);

    const isPublished = status === "publish";
    // A null pin means the portfolio was published before pinning existed:
    // its live site serves live sections, so nothing is "unpublished" until
    // the user runs the full publish flow again and gets pinned
    const hasUnpublishedChanges =
        isPublished &&
        publishedVersionId !== null &&
        activeVersionId !== null &&
        activeVersionId !== publishedVersionId;

    return {
        isPublished,
        hasUnpublishedChanges,
        isPublishing,
        refresh,
        publishChanges,
    };
};
