"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchProfileSocialUsers } from "../profile-social.api";
import type {
    ProfileSocialListKind,
    ProfileSocialUser,
} from "../profile-social.types";

const SOCIAL_LIST_PAGE_SIZE = 24;

interface UseProfileSocialListOptions {
    kind: ProfileSocialListKind;
    open: boolean;
    username: string;
}

export const useProfileSocialList = ({
    kind,
    open,
    username,
}: UseProfileSocialListOptions) => {
    const activeRequestRef = useRef(0);
    const [users, setUsers] = useState<ProfileSocialUser[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPage = useCallback(
        async (pageNumber: number, mode: "replace" | "append") => {
            const requestId = activeRequestRef.current + 1;
            activeRequestRef.current = requestId;

            if (mode === "replace") {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            setError(null);

            try {
                const socialPage = await fetchProfileSocialUsers(
                    username,
                    kind,
                    pageNumber,
                    SOCIAL_LIST_PAGE_SIZE,
                );

                if (activeRequestRef.current !== requestId) return;

                setUsers((current) =>
                    mode === "replace"
                        ? socialPage.content
                        : [...current, ...socialPage.content],
                );
                setPage(socialPage.number);
                setTotal(socialPage.totalElements);
                setHasMore(!socialPage.last);
            } catch (loadError) {
                console.error(`Failed to load profile ${kind}:`, loadError);
                if (activeRequestRef.current === requestId) {
                    setError(`Could not load ${kind}.`);
                }
            } finally {
                if (activeRequestRef.current === requestId) {
                    setIsLoading(false);
                    setIsLoadingMore(false);
                }
            }
        },
        [kind, username],
    );

    useEffect(() => {
        if (!open) return;

        setUsers([]);
        setPage(0);
        setTotal(0);
        setHasMore(false);
        void loadPage(0, "replace");

        return () => {
            activeRequestRef.current += 1;
        };
    }, [loadPage, open]);

    const loadMore = () => {
        if (!hasMore || isLoading || isLoadingMore) return;
        void loadPage(page + 1, "append");
    };

    const refresh = () => {
        void loadPage(0, "replace");
    };

    return {
        error,
        hasMore,
        isLoading,
        isLoadingMore,
        loadMore,
        refresh,
        total,
        users,
    };
};
