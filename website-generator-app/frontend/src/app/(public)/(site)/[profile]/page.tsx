import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { PortfolioCard } from "@/app/(public)/(site)/explore/components/explore.types";
import { getBackendUrl } from "@/lib/server-env";
import type { PublicProfileDTO } from "@/types/public-profile";
import { createServerSupabaseClient } from "@/utils/supabase/server";

import PublicProfileView from "./components/PublicProfileView";

type PublicPortfolioPageResponse = {
    content?: PortfolioCard[];
};

type ProfileMeResponse = {
    username?: string | null;
};

type PublicProfilePageParams = {
    profile: string;
};

const fetchPublicProfileByUsername = async (
    username: string,
): Promise<PublicProfileDTO | null> => {
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(
            `${backendUrl}/api/v1/public/profile/${encodeURIComponent(username)}`,
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

const fetchPublishedPortfoliosByUsername = async (
    username: string,
): Promise<PortfolioCard[]> => {
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(
            `${backendUrl}/api/v1/public/profile/${encodeURIComponent(username)}/portfolios?page=0&size=24`,
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

const fetchCurrentViewerUsername = async (): Promise<string | null> => {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            return null;
        }

        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/v1/profile/me`, {
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

export const generateMetadata = async ({
    params,
}: {
    params: Promise<PublicProfilePageParams>;
}): Promise<Metadata> => {
    const { profile } = await params;
    const publicProfile = await fetchPublicProfileByUsername(profile);

    if (!publicProfile) {
        return { title: "Profile Not Found" };
    }

    const displayName = publicProfile.fullName?.trim() || publicProfile.username;
    const title = `${displayName} | PortRN`;
    const description =
        publicProfile.bio?.trim() ||
        `View ${publicProfile.username}'s portfolio profile on PortRN.`;

    return {
        title,
        description,
        openGraph: {
            type: "profile",
            title,
            description,
            siteName: "PortRN",
        },
        twitter: {
            card: "summary",
            title,
            description,
        },
    };
};

const PublicProfilePage = async ({
    params,
}: {
    params: Promise<PublicProfilePageParams>;
}) => {
    const { profile } = await params;

    const [publicProfile, portfolios, currentViewerUsername] = await Promise.all([
        fetchPublicProfileByUsername(profile),
        fetchPublishedPortfoliosByUsername(profile),
        fetchCurrentViewerUsername(),
    ]);

    if (!publicProfile) {
        notFound();
    }

    const isOwner =
        typeof currentViewerUsername === "string" &&
        currentViewerUsername.toLowerCase() === publicProfile.username.toLowerCase();

    return (
        <PublicProfileView
            profile={publicProfile}
            portfolios={portfolios}
            isOwner={isOwner}
        />
    );
};

export default PublicProfilePage;
