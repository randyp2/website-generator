"use client";

import { useMemo } from "react";

import { useProfileMeQuery } from "./useProfileMeQuery";

interface UseMyProfilePathReturn {
    profilePath: string | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
}

const toProfilePath = (username: unknown): string | null => {
    if (typeof username !== "string") {
        return null;
    }

    const normalized = username.trim();
    if (normalized.length === 0) {
        return null;
    }

    return `/${encodeURIComponent(normalized)}`;
};

const useMyProfilePath = (enabled = true): UseMyProfilePathReturn => {
    const profileQuery = useProfileMeQuery({ enabled });

    const profilePath = useMemo(
        () => (enabled ? toProfilePath(profileQuery.data?.username) : null),
        [enabled, profileQuery.data?.username],
    );

    return {
        profilePath,
        isLoading: enabled && profileQuery.isPending,
        refetch: async () => {
            await profileQuery.refetch();
        },
    };
};

export default useMyProfilePath;
