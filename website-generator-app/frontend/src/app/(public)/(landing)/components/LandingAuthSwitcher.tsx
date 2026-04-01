"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import LandingAuthPanel from "./LandingAuthPanel";
import LandingWelcomeBack from "./LandingWelcomeBack";

type LandingAuthSwitcherProps = {
    username: string;
    email: string;
    avatar: string | null;
};

const LandingAuthSwitcher = ({
    username,
    email,
    avatar,
}: LandingAuthSwitcherProps) => {
    const [view, setView] = useState<"welcome" | "auth">("welcome");

    if (view === "welcome") {
        return (
            <div className="flex min-h-full w-full items-center justify-center">
                <LandingWelcomeBack
                    username={username}
                    email={email}
                    avatar={avatar}
                    onSwitchAccount={() => setView("auth")}
                />
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl pt-10 xl:pt-12">
            <LandingAuthPanel
                backAction={
                    <button
                        type="button"
                        onClick={() => setView("welcome")}
                        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:cursor-pointer hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                }
            />
        </div>
    );
};

export default LandingAuthSwitcher;
