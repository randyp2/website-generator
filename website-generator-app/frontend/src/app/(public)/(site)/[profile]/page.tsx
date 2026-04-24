import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
    fetchCurrentViewerUsername,
    fetchPublicProfileByUsername,
    fetchPublishedPortfoliosByUsername,
} from "@/lib/api/publicProfile";

import PublicProfileView from "./components/PublicProfileView";

type PublicProfilePageParams = {
    profile: string;
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
