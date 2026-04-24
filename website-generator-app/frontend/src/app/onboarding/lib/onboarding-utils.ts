import {
    type FormState,
    type ProfileMeResponse,
    type ProfileUpdatePayload,
    type UsernameState,
} from "../types";

export const DEFAULT_FORM: FormState = {
    username: "",
    fullName: "",
    bio: "",
    location: "",
    school: "",
    degree: "",
    jobTitle: "",
    company: "",
    websiteUrl: "",
    linkedinUrl: "",
    githubUrl: "",
};

export const parseJsonSafely = async <T,>(response: Response): Promise<T | null> => {
    try {
        return (await response.json()) as T;
    } catch {
        return null;
    }
};

export const normalizeOptional = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

export const normalizeUsername = (value: string): string => value.trim().toLowerCase();

export const toPayload = (form: FormState): ProfileUpdatePayload => ({
    username: normalizeUsername(form.username),
    fullName: normalizeOptional(form.fullName),
    bio: normalizeOptional(form.bio),
    location: normalizeOptional(form.location),
    school: normalizeOptional(form.school),
    degree: normalizeOptional(form.degree),
    jobTitle: normalizeOptional(form.jobTitle),
    company: normalizeOptional(form.company),
    websiteUrl: normalizeOptional(form.websiteUrl),
    linkedinUrl: normalizeOptional(form.linkedinUrl),
    githubUrl: normalizeOptional(form.githubUrl),
});

export const mapProfileToForm = (profile: ProfileMeResponse): FormState => ({
    username: profile.username ?? "",
    fullName: profile.fullName ?? "",
    bio: profile.bio ?? "",
    location: profile.location ?? "",
    school: profile.school ?? "",
    degree: profile.degree ?? "",
    jobTitle: profile.jobTitle ?? "",
    company: profile.company ?? "",
    websiteUrl: profile.websiteUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
});

export const hasCompletedOnboarding = (
    profile: ProfileMeResponse | null,
): boolean => {
    const hasUsername =
        typeof profile?.username === "string" && profile.username.trim().length > 0;
    const onboardingComplete = profile?.onboardingComplete === true;
    return hasUsername && onboardingComplete;
};

export const getUsernameMessage = (state: UsernameState): string => {
    if (state.status === "checking") return "Checking availability...";
    if (state.status === "available") return "Username is available.";
    if (state.status === "unavailable") {
        if (state.reason === "reserved") return "This username is reserved.";
        if (state.reason === "taken") return "This username is already taken.";
        if (state.reason === "error") return "Unable to verify username right now.";
        return "Use 3-32 chars: lowercase letters, numbers, hyphens.";
    }
    return "Use 3-32 chars: lowercase letters, numbers, hyphens.";
};
