"use client";

import { useEffect, useState } from "react";

import { usePublicAuthGate } from "@/context/PublicAuthGateContext";
import {
    fetchProfileSocialSummary,
    followProfile,
    recordProfileView,
    unfollowProfile,
} from "../profile-social.api";
import type { ProfileSocialSummary } from "../profile-social.types";

interface UseProfileSocialOptions {
    isOwner: boolean;
    profileId: string;
    username: string;
}

const createEmptySummary = (
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

export const useProfileSocial = ({
    isOwner,
    profileId,
    username,
}: UseProfileSocialOptions) => {
    const { requireAuth, user } = usePublicAuthGate();
    const [summary, setSummary] = useState<ProfileSocialSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTogglingFollow, setIsTogglingFollow] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadSummary = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const nextSummary = await fetchProfileSocialSummary(username);
                if (isMounted) {
                    setSummary(nextSummary);
                }
            } catch (loadError) {
                console.error("Failed to load profile social summary:", loadError);
                if (isMounted) {
                    setSummary(createEmptySummary(profileId, username));
                    setError("Could not load profile stats.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadSummary();

        return () => {
            isMounted = false;
        };
    }, [profileId, username, user?.id]);

    useEffect(() => {
        if (isOwner) return;

        const viewStorageKey = `public-profile:viewed:${username}`;
        if (window.sessionStorage.getItem(viewStorageKey)) return;

        let isMounted = true;
        window.sessionStorage.setItem(viewStorageKey, "1");

        const recordView = async () => {
            try {
                const nextSummary = await recordProfileView(username);
                if (isMounted) {
                    setSummary(nextSummary);
                }
            } catch (recordError) {
                console.error("Failed to record profile view:", recordError);
            }
        };

        void recordView();

        return () => {
            isMounted = false;
        };
    }, [isOwner, username]);

    const toggleFollow = async () => {
        if (isOwner || isTogglingFollow) return;
        if (!requireAuth("engagement")) return;

        const currentSummary = summary ?? createEmptySummary(profileId, username);
        const nextIsFollowing = !currentSummary.viewerIsFollowing;
        const optimisticSummary: ProfileSocialSummary = {
            ...currentSummary,
            followersCount: nextIsFollowing
                ? currentSummary.followersCount + 1
                : Math.max(0, currentSummary.followersCount - 1),
            viewerIsFollowing: nextIsFollowing,
        };

        setError(null);
        setSummary(optimisticSummary);
        setIsTogglingFollow(true);

        try {
            const nextSummary = nextIsFollowing
                ? await followProfile(profileId)
                : await unfollowProfile(profileId);
            setSummary(nextSummary);
        } catch (toggleError) {
            console.error("Failed to toggle profile follow:", toggleError);
            setSummary(currentSummary);
            setError("Could not update follow.");
        } finally {
            setIsTogglingFollow(false);
        }
    };

    return {
        error,
        isLoading,
        isTogglingFollow,
        summary: summary ?? createEmptySummary(profileId, username),
        toggleFollow,
    };
};
