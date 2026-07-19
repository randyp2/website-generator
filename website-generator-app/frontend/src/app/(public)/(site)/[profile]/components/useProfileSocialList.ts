"use client";

import { useMemo } from "react";

import { useProfileSocialUsersInfiniteQuery } from "../profile-social.query";
import type { ProfileSocialListKind } from "../profile-social.types";

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
    const socialListQuery = useProfileSocialUsersInfiniteQuery({
        enabled: open,
        kind,
        pageSize: SOCIAL_LIST_PAGE_SIZE,
        username,
    });
    const users = useMemo(
        () =>
            socialListQuery.data?.pages.flatMap((page) => page.content) ?? [],
        [socialListQuery.data],
    );

    const loadMore = () => {
        if (
            !socialListQuery.hasNextPage ||
            socialListQuery.isFetching ||
            socialListQuery.isFetchingNextPage
        ) {
            return;
        }

        void socialListQuery.fetchNextPage();
    };

    const refresh = () => {
        void socialListQuery.refetch();
    };

    return {
        error: socialListQuery.error ? `Could not load ${kind}.` : null,
        hasMore: Boolean(socialListQuery.hasNextPage),
        isLoading: open && socialListQuery.isPending,
        isLoadingMore: socialListQuery.isFetchingNextPage,
        loadMore,
        refresh,
        total: socialListQuery.data?.pages[0]?.totalElements ?? 0,
        users,
    };
};
