import "server-only";

import type { PortfolioCard } from "@/app/(public)/(site)/explore/components/explore.types";
import { getPublicSiteUrl } from "@/lib/public-env";
import type { PublicProfileDTO } from "@/types/public-profile";
import { createServerSupabaseClient } from "@/utils/supabase/server";

import { fetchBackend } from "./backendFetch";

type PublicPortfolioPageResponse = {
    content?: PortfolioCard[];
};

type ProfileMeResponse = {
    username?: string | null;
};

export const fetchPublicProfileByUsername = async (
    username: string,
): Promise<PublicProfileDTO | null> => {
    try {
        const siteUrl = getPublicSiteUrl();
        const response = await fetch(
            `${siteUrl}/api/public/profile/${encodeURIComponent(username)}`,
            { next: { revalidate: 30 } },
        );

        if (!response.ok) {
            return null;
        }

        return (await response.json()) as PublicProfileDTO;
    } catch {
        return null;
    }
};

export const fetchPublishedPortfoliosByUsername = async (
    username: string,
    options?: { page?: number; size?: number },
): Promise<PortfolioCard[]> => {
    const page = options?.page ?? 0;
    const size = options?.size ?? 24;

    try {
        const siteUrl = getPublicSiteUrl();
        const response = await fetch(
            `${siteUrl}/api/public/profile/${encodeURIComponent(username)}/portfolios?page=${encodeURIComponent(String(page))}&size=${encodeURIComponent(String(size))}`,
            { next: { revalidate: 30 } },
        );

        if (!response.ok) {
            return [];
        }

        const payload = (await response.json()) as PublicPortfolioPageResponse;
        return Array.isArray(payload.content) ? payload.content : [];
    } catch {
        return [];
    }
};

export const fetchCurrentViewerUsername = async (): Promise<string | null> => {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            return null;
        }

        const response = await fetchBackend("/api/v1/profile/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const me = (await response.json()) as ProfileMeResponse;
        return typeof me.username === "string" ? me.username : null;
    } catch {
        return null;
    }
};
