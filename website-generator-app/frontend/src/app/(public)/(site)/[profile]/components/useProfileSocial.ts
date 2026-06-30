"use client";

import { useEffect, useState } from "react";

import { usePublicAuthGate } from "@/context/PublicAuthGateContext";
import {
    createEmptyProfileSocialSummary,
    useProfileSocialSummaryQuery,
    useRecordProfileViewMutation,
    useToggleProfileFollowMutation,
} from "../profile-social.query";

interface UseProfileSocialOptions {
    isOwner: boolean;
    profileId: string;
    username: string;
}

export const useProfileSocial = ({
    isOwner,
    profileId,
    username,
}: UseProfileSocialOptions) => {
    const { isAuthReady, requireAuth, user } = usePublicAuthGate();
    const viewerId = user?.id ?? null;
    const profileErrorKey = `${profileId}:${username}`;
    const [actionError, setActionError] = useState<{
        message: string;
        profileErrorKey: string;
    } | null>(null);
    const summaryQuery = useProfileSocialSummaryQuery({
        enabled: isAuthReady,
        username,
        viewerId,
    });
    const { mutate: recordProfileViewMutation } =
        useRecordProfileViewMutation();
    const {
        isPending: isTogglingFollow,
        mutate: toggleProfileFollowMutation,
    } = useToggleProfileFollowMutation();
    const summary =
        summaryQuery.data ??
        createEmptyProfileSocialSummary(profileId, username);
    const currentActionError =
        actionError?.profileErrorKey === profileErrorKey
            ? actionError.message
            : null;

    useEffect(() => {
        if (isOwner || !isAuthReady || !summaryQuery.isSuccess) return;

        const viewStorageKey = `public-profile:viewed:${username}`;
        if (window.sessionStorage.getItem(viewStorageKey)) return;

        window.sessionStorage.setItem(viewStorageKey, "1");
        recordProfileViewMutation(
            { username, viewerId },
            {
                onError: (recordError) => {
                    console.error("Failed to record profile view:", recordError);
                    window.sessionStorage.removeItem(viewStorageKey);
                },
            },
        );
    }, [
        isAuthReady,
        isOwner,
        recordProfileViewMutation,
        summaryQuery.isSuccess,
        username,
        viewerId,
    ]);

    const toggleFollow = () => {
        if (isOwner || isTogglingFollow) return;
        if (!requireAuth("engagement")) return;

        setActionError(null);
        toggleProfileFollowMutation(
            {
                profileId,
                username,
                viewerId,
                viewerIsFollowing: summary.viewerIsFollowing,
            },
            {
                onError: (toggleError) => {
                    console.error(
                        "Failed to toggle profile follow:",
                        toggleError,
                    );
                    setActionError({
                        message: "Could not update follow.",
                        profileErrorKey,
                    });
                },
            },
        );
    };

    return {
        error:
            currentActionError ??
            (summaryQuery.isError ? "Could not load profile stats." : null),
        isLoading: !isAuthReady || summaryQuery.isPending,
        isTogglingFollow,
        summary,
        toggleFollow,
    };
};
