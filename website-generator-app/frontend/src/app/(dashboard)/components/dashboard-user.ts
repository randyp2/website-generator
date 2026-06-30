import type { UserData } from "@/context/UserContext";
import type { ProfileMeResponse } from "@/hooks/useProfileMeQuery";

export interface DashboardAuthUserFallback {
    avatarUrl: string | null;
    email: string | null;
    fullName: string | null;
    id: string;
}

const nonEmptyString = (value: unknown): string | null => {
    if (typeof value !== "string") return null;

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const getEmailLocalPart = (email: string | null): string | null => {
    const normalizedEmail = nonEmptyString(email);
    if (!normalizedEmail) return null;

    return nonEmptyString(normalizedEmail.split("@")[0]);
};

export const toDashboardUser = (
    profile: ProfileMeResponse | null | undefined,
    fallback: DashboardAuthUserFallback,
): UserData => {
    const email = nonEmptyString(profile?.email) ?? fallback.email ?? "No Email";
    const displayName =
        nonEmptyString(profile?.fullName) ??
        nonEmptyString(profile?.username) ??
        nonEmptyString(fallback.fullName) ??
        getEmailLocalPart(email) ??
        "User";

    return {
        id: fallback.id,
        username: displayName,
        email,
        avatar:
            nonEmptyString(profile?.avatarUrl) ??
            nonEmptyString(fallback.avatarUrl),
    };
};
