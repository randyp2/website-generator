export interface ProfileSocialSummary {
    profileId: string;
    username: string | null;
    followersCount: number;
    followingCount: number;
    profileViewsCount: number;
    portfolioLikesCount: number;
    viewerIsFollowing: boolean;
}

export type ProfileSocialListKind = "followers" | "following";

export interface ProfileSocialUser {
    profileId: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    jobTitle: string | null;
    company: string | null;
    location: string | null;
    followedAt: string;
}

export interface ProfileSocialUsersPage {
    content: ProfileSocialUser[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
}
