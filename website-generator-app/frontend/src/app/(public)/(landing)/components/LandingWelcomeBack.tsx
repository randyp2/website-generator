"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type LandingWelcomeBackProps = {
    username: string;
    email: string;
    avatar: string | null;
    onSwitchAccount: () => void;
};

const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const LandingWelcomeBack = ({
    username,
    email,
    avatar,
    onSwitchAccount,
}: LandingWelcomeBackProps) => {
    const router = useRouter();

    return (
        <div className="flex w-full max-w-xl flex-col items-center space-y-8 text-card-foreground">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                    Welcome back
                </h2>
                <p className="text-sm text-muted-foreground">
                    Continue where you left off
                </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
                <Avatar className="size-24 border-2 border-border shadow-lg">
                    <AvatarImage src={avatar ?? undefined} alt={username} />
                    <AvatarFallback className="bg-primary/15 text-2xl font-semibold text-primary">
                        {getInitials(username)}
                    </AvatarFallback>
                </Avatar>

                <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">
                        {username}
                    </p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                </div>
            </div>

            <div className="w-full space-y-4">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard-user")}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:cursor-pointer hover:bg-primary/90"
                >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
                        Or
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <p className="text-center">
                    <button
                        type="button"
                        onClick={onSwitchAccount}
                        className="text-sm font-semibold text-primary transition-colors hover:cursor-pointer hover:text-primary/80"
                    >
                        Sign in with a different account
                    </button>
                    <span className="px-2 text-muted-foreground/60">|</span>
                    <Link
                        href="/explore"
                        className="text-sm font-medium text-[#f59e0b] transition-colors hover:text-[#fbbf24]"
                    >
                        Browse portfolios
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LandingWelcomeBack;
