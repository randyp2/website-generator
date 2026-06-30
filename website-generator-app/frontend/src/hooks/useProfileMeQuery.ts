"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
    type QueryClient,
} from "@tanstack/react-query";

export type ProfileMeBillingSnapshot = {
    creditBalance?: number | null;
    activePlanKey?: string | null;
    activePriceKey?: string | null;
    status?: string | null;
    currentPeriodEnd?: string | null;
    cancelAt?: string | null;
    cancelAtPeriodEnd?: boolean | null;
};

export type ProfileMeResponse = {
    id?: string | null;
    username?: string | null;
    email?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    bannerUrl?: string | null;
    location?: string | null;
    school?: string | null;
    degree?: string | null;
    jobTitle?: string | null;
    company?: string | null;
    websiteUrl?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    onboardingComplete?: boolean | null;
    billing?: ProfileMeBillingSnapshot | null;
};

export type ProfileMePatch = Partial<ProfileMeResponse> &
    Record<string, unknown>;

export class ProfileMeRequestError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ProfileMeRequestError";
        this.status = status;
    }
}

export const profileMeQueryKey = ["profile-me"] as const;

const readProfileMeError = async (
    response: Response,
    fallback: string,
): Promise<string> => {
    const payload = await response.json().catch(() => null);
    if (payload && typeof payload === "object") {
        const message =
            "error" in payload
                ? payload.error
                : "message" in payload
                    ? payload.message
                    : null;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
    }

    const text = await response.text().catch(() => "");
    return text.trim() || fallback;
};

export const fetchProfileMe = async (): Promise<ProfileMeResponse> => {
    const response = await fetch("/api/profile/me", {
        method: "GET",
        credentials: "same-origin",
    });

    if (!response.ok) {
        throw new ProfileMeRequestError(
            await readProfileMeError(response, "Failed to fetch profile."),
            response.status,
        );
    }

    return (await response.json()) as ProfileMeResponse;
};

export const updateProfileMe = async (
    patch: ProfileMePatch,
): Promise<ProfileMeResponse> => {
    const response = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(patch),
    });

    if (!response.ok) {
        throw new ProfileMeRequestError(
            await readProfileMeError(response, "Failed to update profile."),
            response.status,
        );
    }

    return (await response.json()) as ProfileMeResponse;
};

export const setProfileMeQueryData = (
    queryClient: QueryClient,
    profile: ProfileMeResponse,
) => {
    queryClient.setQueryData(profileMeQueryKey, profile);
};

export const useProfileMeQuery = ({
    enabled = true,
    initialData,
}: {
    enabled?: boolean;
    initialData?: ProfileMeResponse;
} = {}) =>
    useQuery({
        queryKey: profileMeQueryKey,
        queryFn: fetchProfileMe,
        enabled,
        initialData,
    });

export const useUpdateProfileMeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfileMe,
        onSuccess: (profile) => {
            setProfileMeQueryData(queryClient, profile);
        },
    });
};

export const getProfileMeErrorStatus = (error: unknown): number | null =>
    error instanceof ProfileMeRequestError ? error.status : null;
