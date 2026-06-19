import type {
    ProfileSocialListKind,
    ProfileSocialSummary,
    ProfileSocialUsersPage,
} from "./profile-social.types";

const readJson = async <T>(
    response: Response,
    fallbackMessage: string,
): Promise<T> => {
    if (response.ok) {
        return (await response.json()) as T;
    }

    let message = fallbackMessage;
    try {
        const payload = (await response.json()) as {
            error?: unknown;
            message?: unknown;
        };
        if (typeof payload.error === "string") {
            message = payload.error;
        } else if (typeof payload.message === "string") {
            message = payload.message;
        }
    } catch {
        const text = await response.text().catch(() => "");
        if (text) message = text;
    }

    throw new Error(message);
};

const publicSocialPath = (username: string): string =>
    `/api/public/profile/${encodeURIComponent(username)}/social`;

const authenticatedSocialPath = (profileId: string): string =>
    `/api/profile/social/${encodeURIComponent(profileId)}`;

export const fetchProfileSocialSummary = async (
    username: string,
): Promise<ProfileSocialSummary> => {
    const response = await fetch(publicSocialPath(username), {
        cache: "no-store",
        credentials: "same-origin",
    });

    return readJson<ProfileSocialSummary>(
        response,
        "Failed to load profile social summary.",
    );
};

export const recordProfileView = async (
    username: string,
): Promise<ProfileSocialSummary> => {
    const response = await fetch(`${publicSocialPath(username)}/views`, {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
    });

    return readJson<ProfileSocialSummary>(
        response,
        "Failed to record profile view.",
    );
};

export const fetchProfileSocialUsers = async (
    username: string,
    kind: ProfileSocialListKind,
    page: number,
    size: number,
): Promise<ProfileSocialUsersPage> => {
    const searchParams = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    const response = await fetch(
        `${publicSocialPath(username)}/${kind}?${searchParams.toString()}`,
        {
            cache: "no-store",
            credentials: "same-origin",
        },
    );

    return readJson<ProfileSocialUsersPage>(
        response,
        `Failed to load ${kind}.`,
    );
};

export const followProfile = async (
    profileId: string,
): Promise<ProfileSocialSummary> => {
    const response = await fetch(`${authenticatedSocialPath(profileId)}/follow`, {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
    });

    return readJson<ProfileSocialSummary>(response, "Failed to follow profile.");
};

export const unfollowProfile = async (
    profileId: string,
): Promise<ProfileSocialSummary> => {
    const response = await fetch(`${authenticatedSocialPath(profileId)}/follow`, {
        method: "DELETE",
        cache: "no-store",
        credentials: "same-origin",
    });

    return readJson<ProfileSocialSummary>(
        response,
        "Failed to unfollow profile.",
    );
};
