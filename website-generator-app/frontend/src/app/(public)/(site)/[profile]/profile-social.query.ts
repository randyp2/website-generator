"use client";

import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
    type QueryClient,
} from "@tanstack/react-query";

import {
    fetchProfileSocialSummary,
    fetchProfileSocialUsers,
    followProfile,
    recordProfileView,
    unfollowProfile,
} from "./profile-social.api";
import type {
    ProfileSocialListKind,
    ProfileSocialSummary,
} from "./profile-social.types";

const anonymousViewerKey = "anonymous";

const viewerKey = (viewerId: string | null | undefined): string =>
    viewerId ?? anonymousViewerKey;

export const profileSocialQueryKeys = {
    all: ["profile-social"] as const,
    profile: (username: string) =>
        [...profileSocialQueryKeys.all, "profile", username] as const,
    summary: (username: string, viewerId?: string | null) =>
        [
            ...profileSocialQueryKeys.profile(username),
            "summary",
            { viewerId: viewerKey(viewerId) },
        ] as const,
    lists: (username: string) =>
        [...profileSocialQueryKeys.profile(username), "lists"] as const,
    list: (
        username: string,
        kind: ProfileSocialListKind,
        pageSize: number,
    ) => [...profileSocialQueryKeys.lists(username), kind, { pageSize }] as const,
};

export const createEmptyProfileSocialSummary = (
    profileId: string,
    username: string,
): ProfileSocialSummary => ({
    profileId,
    username,
    followersCount: 0,
    followingCount: 0,
    profileViewsCount: 0,
    portfolioLikesCount: 0,
    viewerIsFollowing: false,
});

const setProfileSocialSummary = (
    queryClient: QueryClient,
    username: string,
    viewerId: string | null | undefined,
    summary: ProfileSocialSummary,
) => {
    queryClient.setQueryData(
        profileSocialQueryKeys.summary(username, viewerId),
        summary,
    );
};

export const useProfileSocialSummaryQuery = ({
    enabled = true,
    username,
    viewerId,
}: {
    enabled?: boolean;
    username: string;
    viewerId?: string | null;
}) =>
    useQuery({
        queryKey: profileSocialQueryKeys.summary(username, viewerId),
        queryFn: () => fetchProfileSocialSummary(username),
        enabled: enabled && username.trim().length > 0,
    });

export const useProfileSocialUsersInfiniteQuery = ({
    enabled = true,
    kind,
    pageSize,
    username,
}: {
    enabled?: boolean;
    kind: ProfileSocialListKind;
    pageSize: number;
    username: string;
}) =>
    useInfiniteQuery({
        queryKey: profileSocialQueryKeys.list(username, kind, pageSize),
        queryFn: ({ pageParam }) =>
            fetchProfileSocialUsers(username, kind, Number(pageParam), pageSize),
        initialPageParam: 0,
        getNextPageParam: (lastPage) =>
            lastPage.last ? undefined : lastPage.number + 1,
        enabled: enabled && username.trim().length > 0,
    });

export const useRecordProfileViewMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            username,
        }: {
            username: string;
            viewerId?: string | null;
        }) => recordProfileView(username),
        onSuccess: (summary, variables) => {
            setProfileSocialSummary(
                queryClient,
                variables.username,
                variables.viewerId,
                summary,
            );
        },
    });
};

export const useToggleProfileFollowMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            profileId,
            viewerIsFollowing,
        }: {
            profileId: string;
            username: string;
            viewerId?: string | null;
            viewerIsFollowing: boolean;
        }) =>
            viewerIsFollowing
                ? unfollowProfile(profileId)
                : followProfile(profileId),
        onMutate: async (variables) => {
            const queryKey = profileSocialQueryKeys.summary(
                variables.username,
                variables.viewerId,
            );

            await queryClient.cancelQueries({ queryKey });

            const previous =
                queryClient.getQueryData<ProfileSocialSummary>(queryKey);
            const current =
                previous ??
                createEmptyProfileSocialSummary(
                    variables.profileId,
                    variables.username,
                );
            const nextViewerIsFollowing = !variables.viewerIsFollowing;

            queryClient.setQueryData<ProfileSocialSummary>(queryKey, {
                ...current,
                followersCount: nextViewerIsFollowing
                    ? current.followersCount + 1
                    : Math.max(0, current.followersCount - 1),
                viewerIsFollowing: nextViewerIsFollowing,
            });

            return { previous };
        },
        onError: (_error, variables, context) => {
            const queryKey = profileSocialQueryKeys.summary(
                variables.username,
                variables.viewerId,
            );

            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
                return;
            }

            queryClient.removeQueries({ queryKey, exact: true });
        },
        onSuccess: (summary, variables) => {
            setProfileSocialSummary(
                queryClient,
                variables.username,
                variables.viewerId,
                summary,
            );
            void queryClient.invalidateQueries({
                queryKey: profileSocialQueryKeys.lists(variables.username),
            });
        },
    });
};
