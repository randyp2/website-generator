"use client";

import { useEffect, useMemo, useState } from "react";

import ProfileHeader from "@/app/(dashboard)/dashboard/components/ProfileHeader";
import ProfilePortfoliosGrid from "@/app/(dashboard)/dashboard/components/ProfilePortfoliosGrid";
import type { PortfolioCard } from "@/app/(public)/(site)/explore/components/explore.types";
import type { PublicProfileDTO } from "@/types/public-profile";
import type { ProfileSocialListKind } from "../profile-social.types";
import EditProfileModal, {
    type EditableProfileFields,
} from "./EditProfileModal";
import ProfileSocialListDialog from "./ProfileSocialListDialog";
import PublicVerificationTab from "./PublicVerificationTab";
import { useProfileSocial } from "./useProfileSocial";

const PUBLIC_PROFILE_TABS = ["Portfolios", "Verification"] as const;

type PublicProfileTab = (typeof PUBLIC_PROFILE_TABS)[number];

type PublicProfileViewProps = {
    profile: PublicProfileDTO;
    portfolios: PortfolioCard[];
    isOwner: boolean;
};

const PublicProfileView = ({
    profile,
    portfolios,
    isOwner,
}: PublicProfileViewProps) => {
    const [activeTab, setActiveTab] = useState<PublicProfileTab>("Portfolios");
    const [displayedProfile, setDisplayedProfile] = useState(profile);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [openSocialList, setOpenSocialList] =
        useState<ProfileSocialListKind | null>(null);
    const profileSocial = useProfileSocial({
        isOwner,
        profileId: displayedProfile.id,
        username: displayedProfile.username,
    });

    useEffect(() => {
        setDisplayedProfile(profile);
    }, [profile]);

    const displayName = useMemo(
        () => displayedProfile.fullName?.trim() || displayedProfile.username,
        [displayedProfile.fullName, displayedProfile.username],
    );

    const handleProfileSaved = (updated: EditableProfileFields) => {
        setDisplayedProfile((prev) => ({ ...prev, ...updated }));
    };

    return (
        <div className="space-y-8 px-8 py-8 sm:px-10 md:px-14 lg:px-20 xl:px-28 2xl:px-36">
            <ProfileHeader
                username={displayName}
                handle={displayedProfile.username}
                avatarUrl={displayedProfile.avatarUrl}
                bio={displayedProfile.bio}
                jobTitle={displayedProfile.jobTitle}
                company={displayedProfile.company}
                school={displayedProfile.school}
                degree={displayedProfile.degree}
                location={displayedProfile.location}
                websiteUrl={displayedProfile.websiteUrl}
                linkedinUrl={displayedProfile.linkedinUrl}
                githubUrl={displayedProfile.githubUrl}
                showEditProfileButton={isOwner}
                showFollowButton={!isOwner}
                socialStats={{
                    followersCount: profileSocial.summary.followersCount,
                    followingCount: profileSocial.summary.followingCount,
                    profileViewsCount: profileSocial.summary.profileViewsCount,
                    portfolioLikesCount: profileSocial.summary.portfolioLikesCount,
                }}
                socialError={profileSocial.error}
                isFollowing={profileSocial.summary.viewerIsFollowing}
                isFollowLoading={profileSocial.isTogglingFollow}
                isSocialLoading={profileSocial.isLoading}
                onToggleFollow={profileSocial.toggleFollow}
                onFollowersClick={() => setOpenSocialList("followers")}
                onFollowingClick={() => setOpenSocialList("following")}
                onEditProfile={
                    isOwner ? () => setIsEditOpen(true) : undefined
                }
            />

            <div className="space-y-6">
                <div className="flex gap-6 border-b border-border">
                    {PUBLIC_PROFILE_TABS.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-medium transition-colors hover:cursor-pointer ${
                                activeTab === tab
                                    ? "border-b-2 border-primary text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div>
                    {activeTab === "Portfolios" ? (
                        <ProfilePortfoliosGrid
                            portfolios={portfolios}
                            loading={false}
                        />
                    ) : activeTab === "Verification" ? (
                        <PublicVerificationTab username={displayedProfile.username} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <p className="text-lg font-medium text-foreground">{activeTab}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Coming soon.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {isOwner && (
                <EditProfileModal
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    profile={displayedProfile}
                    onSaved={handleProfileSaved}
                />
            )}

            {openSocialList && (
                <ProfileSocialListDialog
                    count={
                        openSocialList === "followers"
                            ? profileSocial.summary.followersCount
                            : profileSocial.summary.followingCount
                    }
                    displayName={displayName}
                    kind={openSocialList}
                    open={openSocialList !== null}
                    onOpenChange={(open) => {
                        if (!open) setOpenSocialList(null);
                    }}
                    username={displayedProfile.username}
                />
            )}
        </div>
    );
};

export default PublicProfileView;
