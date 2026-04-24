import {
    type FormState,
    type ProfileMeResponse,
    type ProfileUpdatePayload,
    type UsernameState,
} from "../types";

export const DEFAULT_FORM: FormState = {
    username: "",
    firstName: "",
    lastName: "",
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

const composeFullName = (form: FormState): string | undefined => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    return fullName.length > 0 ? fullName : undefined;
};

const splitFullName = (value: string | null | undefined): Pick<FormState, "firstName" | "lastName"> => {
    const normalized = value?.trim() ?? "";
    if (normalized.length === 0) {
        return {
            firstName: "",
            lastName: "",
        };
    }

    const parts = normalized.split(/\s+/);
    const [firstName, ...rest] = parts;
    return {
        firstName: firstName ?? "",
        lastName: rest.join(" "),
    };
};

export const toPayload = (form: FormState): ProfileUpdatePayload => ({
    username: normalizeUsername(form.username),
    fullName: composeFullName(form),
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

export const mapProfileToForm = (profile: ProfileMeResponse): FormState => {
    const { firstName, lastName } = splitFullName(profile.fullName);
    return {
        username: profile.username ?? "",
        firstName,
        lastName,
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        school: profile.school ?? "",
        degree: profile.degree ?? "",
        jobTitle: profile.jobTitle ?? "",
        company: profile.company ?? "",
        websiteUrl: profile.websiteUrl ?? "",
        linkedinUrl: profile.linkedinUrl ?? "",
        githubUrl: profile.githubUrl ?? "",
    };
};

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
