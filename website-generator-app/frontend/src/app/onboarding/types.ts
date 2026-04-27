export type ProfileMeResponse = {
    username?: string | null;
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
};

export type ProfileUpdateErrorResponse = {
    error?: string;
};

export type UsernameAvailabilityResponse = {
    username?: string | null;
    available?: boolean;
    reason?: string | null;
};

export type FormState = {
    username: string;
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
    school: string;
    degree: string;
    jobTitle: string;
    company: string;
    websiteUrl: string;
    linkedinUrl: string;
    githubUrl: string;
};

export type ProfileUpdatePayload = {
    username: string;
    fullName?: string;
    bio?: string;
    location?: string;
    school?: string;
    degree?: string;
    jobTitle?: string;
    company?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
};

export type UsernameStatus = "idle" | "checking" | "available" | "unavailable";

export type UsernameState = {
    status: UsernameStatus;
    reason: string | null;
};
