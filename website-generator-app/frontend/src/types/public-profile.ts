export interface PublicProfileDTO {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    bannerUrl: string | null;
    location: string | null;
    school: string | null;
    degree: string | null;
    jobTitle: string | null;
    company: string | null;
    websiteUrl: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
}
