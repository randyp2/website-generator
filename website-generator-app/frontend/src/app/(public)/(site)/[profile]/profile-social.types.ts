export interface ProfileSocialSummary {
    profileId: string;
    username: string | null;
    followersCount: number;
    followingCount: number;
    profileViewsCount: number;
    portfolioLikesCount: number;
    viewerIsFollowing: boolean;
}
