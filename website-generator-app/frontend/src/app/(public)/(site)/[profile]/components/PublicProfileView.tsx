"use client";

import { useMemo, useState } from "react";

import ProfileHeader from "@/app/(dashboard)/dashboard/components/ProfileHeader";
import ProfilePortfoliosGrid from "@/app/(dashboard)/dashboard/components/ProfilePortfoliosGrid";
import type { PortfolioCard } from "@/app/(public)/(site)/explore/components/explore.types";
import type { PublicProfileDTO } from "@/types/public-profile";
import PublicVerificationTab from "./PublicVerificationTab";

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
    const displayName = useMemo(
        () => profile.fullName?.trim() || profile.username,
        [profile.fullName, profile.username],
    );

    return (
        <div className="space-y-8 px-8 py-8 sm:px-10 md:px-14 lg:px-20 xl:px-28 2xl:px-36">
            <ProfileHeader
                username={displayName}
                avatarUrl={profile.avatarUrl}
                bio={profile.bio}
                showEditProfileButton={isOwner}
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
                        <PublicVerificationTab username={profile.username} />
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
        </div>
    );
};

export default PublicProfileView;
