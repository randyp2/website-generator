"use client";

import Link from "next/link";
import {
    BriefcaseBusiness,
    Loader2,
    MapPin,
    UserCheck,
    Users,
    type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type {
    ProfileSocialListKind,
    ProfileSocialUser,
} from "../profile-social.types";
import { useProfileSocialList } from "./useProfileSocialList";

interface ProfileSocialListDialogProps {
    count: number;
    displayName: string;
    kind: ProfileSocialListKind;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    username: string;
}

const numberFormatter = new Intl.NumberFormat();

const formatProfileCount = (count: number): string =>
    `${numberFormatter.format(count)} ${count === 1 ? "profile" : "profiles"}`;

const formatFollowerCount = (count: number): string =>
    `${numberFormatter.format(count)} ${count === 1 ? "follower" : "followers"}`;

const listCopy = {
    followers: {
        title: "Followers",
        empty: "No followers yet.",
        description: (count: number, displayName: string) =>
            `${formatFollowerCount(count)} of ${displayName}`,
        Icon: Users,
    },
    following: {
        title: "Following",
        empty: "Not following anyone yet.",
        description: (count: number, displayName: string) =>
            `${displayName} follows ${formatProfileCount(count)}`,
        Icon: UserCheck,
    },
} satisfies Record<
    ProfileSocialListKind,
    {
        title: string;
        empty: string;
        description: (count: number, displayName: string) => string;
        Icon: LucideIcon;
    }
>;

const nonEmpty = (value: string | null | undefined): string | null => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const getInitials = (name: string): string => {
    const parts = name.split(/\s+/).filter(Boolean);
    return parts
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

const getDisplayName = (user: ProfileSocialUser): string =>
    nonEmpty(user.fullName) ?? nonEmpty(user.username) ?? "Webgen user";

const getSubtitle = (user: ProfileSocialUser): string | null => {
    const jobTitle = nonEmpty(user.jobTitle);
    const company = nonEmpty(user.company);
    const location = nonEmpty(user.location);

    if (jobTitle && company) return `${jobTitle} at ${company}`;
    return jobTitle ?? company ?? location;
};

const SocialUserRow = ({
    onNavigate,
    user,
}: {
    onNavigate: () => void;
    user: ProfileSocialUser;
}) => {
    const displayName = getDisplayName(user);
    const username = nonEmpty(user.username);
    const subtitle = getSubtitle(user);
    const rowContent = (
        <>
            <Avatar className="size-12 border border-border">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {getInitials(displayName) || "U"}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {displayName}
                    </p>
                    {username && (
                        <p className="truncate text-xs text-muted-foreground">
                            @{username}
                        </p>
                    )}
                </div>
                {subtitle && (
                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                        {user.jobTitle || user.company ? (
                            <BriefcaseBusiness className="size-3.5 shrink-0" />
                        ) : (
                            <MapPin className="size-3.5 shrink-0" />
                        )}
                        <span className="truncate">{subtitle}</span>
                    </div>
                )}
            </div>
        </>
    );

    if (!username) {
        return (
            <div className="flex items-center gap-3 px-4 py-3">
                {rowContent}
            </div>
        );
    }

    return (
        <Link
            href={`/${encodeURIComponent(username)}`}
            onClick={onNavigate}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:cursor-pointer hover:bg-muted/60"
        >
            {rowContent}
        </Link>
    );
};

const SocialListSkeleton = () => (
    <div className="space-y-1 px-4 py-3">
        {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-2">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                </div>
            </div>
        ))}
    </div>
);

const ProfileSocialListDialog = ({
    count,
    displayName,
    kind,
    onOpenChange,
    open,
    username,
}: ProfileSocialListDialogProps) => {
    const socialListState = useProfileSocialList({ kind, open, username });
    const displayedCount = socialListState.total || count;
    const copy = listCopy[kind];
    const Icon = copy.Icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-xl [&>button]:data-[state=open]:bg-transparent [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0 [&>button]:hover:cursor-pointer [&>button]:hover:text-primary">
                <DialogHeader className="border-b border-border px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="size-5" />
                        </div>
                        <div>
                            <DialogTitle>{copy.title}</DialogTitle>
                            <DialogDescription>
                                {copy.description(displayedCount, displayName)}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto">
                    {socialListState.isLoading ? (
                        <SocialListSkeleton />
                    ) : socialListState.error ? (
                        <div className="px-6 py-10 text-center">
                            <p className="text-sm font-medium text-foreground">
                                {socialListState.error}
                            </p>
                            <button
                                type="button"
                                onClick={socialListState.refresh}
                                className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:cursor-pointer hover:bg-muted"
                            >
                                Try again
                            </button>
                        </div>
                    ) : socialListState.users.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-medium text-foreground">
                                {copy.empty}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {socialListState.users.map((user) => (
                                <SocialUserRow
                                    key={user.profileId}
                                    user={user}
                                    onNavigate={() => onOpenChange(false)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {socialListState.hasMore && !socialListState.isLoading && !socialListState.error && (
                    <div className="border-t border-border px-6 py-4">
                        <button
                            type="button"
                            onClick={socialListState.loadMore}
                            disabled={socialListState.isLoadingMore}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:cursor-pointer hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {socialListState.isLoadingMore && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            Load more
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ProfileSocialListDialog;
