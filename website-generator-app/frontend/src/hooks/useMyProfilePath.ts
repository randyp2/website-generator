"use client";

import { useCallback, useEffect, useState } from "react";

type ProfileMeResponse = {
    username?: string | null;
};

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
    const [profilePath, setProfilePath] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(enabled);

    const fetchProfilePath = useCallback(async (): Promise<void> => {
        if (!enabled) {
            setProfilePath(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/profile/me", {
                method: "GET",
                cache: "no-store",
            });

            if (!response.ok) {
                setProfilePath(null);
                return;
            }

            const payload = (await response.json()) as ProfileMeResponse;
            setProfilePath(toProfilePath(payload.username));
        } catch {
            setProfilePath(null);
        } finally {
            setIsLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        void fetchProfilePath();
    }, [fetchProfilePath]);

    return {
        profilePath,
        isLoading,
        refetch: fetchProfilePath,
    };
};

export default useMyProfilePath;
