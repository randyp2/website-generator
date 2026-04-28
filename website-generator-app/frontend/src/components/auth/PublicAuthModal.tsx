"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FcGoogle } from "react-icons/fc";

import type { AuthModalReason } from "@/context/PublicAuthGateContext";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

type Mode = "login" | "signup";

const REASON_COPY: Record<
    AuthModalReason,
    { title: string; description: string; cta: string }
> = {
    general: {
        title: "Join to continue",
        description:
            "Create your account to unlock member features and continue where you left off.",
        cta: "Create free account",
    },
    pricing: {
        title: "Create an account to continue checkout",
        description: "",
        cta: "Create account to continue",
    },
    engagement: {
        title: "Create an account for portfolio engagement",
        description:
            "Create an account to like, save, and interact with portfolios across explore.",
        cta: "Create account",
    },
    comment: {
        title: "Create an account for comments",
        description:
            "Create an account to post comments and join portfolio feedback threads.",
        cta: "Create account",
    },
};

type PublicAuthModalProps = {
    open: boolean;
    reason: AuthModalReason;
    onOpenChange: (open: boolean) => void;
};

export const PublicAuthModal = ({
    open,
    reason,
    onOpenChange,
}: PublicAuthModalProps) => {
    const [mode, setMode] = useState<Mode>("signup");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const supabase = useMemo(() => createClient(), []);

    const copy = REASON_COPY[reason];
    const primaryButtonLabel = mode === "signup" ? copy.cta : "Log in";

    const resetState = () => {
        setErrorMessage(null);
        setIsSuccess(false);
        setSuccessMessage("");
    };

    const onModeChange = (nextMode: Mode) => {
        setMode(nextMode);
        resetState();
    };

    useEffect(() => {
        if (!open) {
            return;
        }

        setMode("signup");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setErrorMessage(null);
        setIsSuccess(false);
        setSuccessMessage("");
    }, [open, reason]);

    const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoading) {
            return;
        }

        resetState();
        setIsLoading(true);

        try {
            if (mode === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });

                if (error) {
                    setErrorMessage(error.message);
                    return;
                }

                setIsSuccess(true);
                setSuccessMessage("Logged in successfully.");
                onOpenChange(false);
                return;
            }

            const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        full_name: fullName,
                        email: email.trim(),
                    },
                },
            });

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            setIsSuccess(true);

            if (data.session) {
                setSuccessMessage("Account created successfully.");
                onOpenChange(false);
                return;
            }

            setSuccessMessage(
                "Check your email to verify your account, then log in.",
            );
        } catch {
            setErrorMessage("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleOauth = async () => {
        if (isLoading) {
            return;
        }

        resetState();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/post-login`,
                    queryParams: {
                        access_type: "offline",
                        prompt: "consent",
                    },
                },
            });

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            if (data.url) {
                window.location.assign(data.url);
            }
        } catch {
            setErrorMessage("Unable to start Google sign-in.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md [&_button]:hover:cursor-pointer">
                <DialogHeader>
                    <DialogTitle>{copy.title}</DialogTitle>
                    <DialogDescription>{copy.description}</DialogDescription>
                </DialogHeader>

                <div className="mx-auto mt-1 w-fit">
                    <div className="relative inline-flex rounded-full border border-border bg-muted/30 p-1">
                        <span
                            aria-hidden="true"
                            className={cn(
                                "absolute left-1 top-1 h-8 w-24 rounded-full bg-[#cc7d23] shadow-sm transition-transform duration-300 ease-out",
                                mode === "signup"
                                    ? "translate-x-0"
                                    : "translate-x-24",
                            )}
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className={cn(
                                "relative z-10 h-8 w-24 rounded-full text-xs",
                                mode === "signup"
                                    ? "text-white"
                                    : "text-muted-foreground",
                            )}
                            onClick={() => onModeChange("signup")}
                        >
                            Sign up
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className={cn(
                                "relative z-10 h-8 w-24 rounded-full text-xs",
                                mode === "login"
                                    ? "text-white"
                                    : "text-muted-foreground",
                            )}
                            onClick={() => onModeChange("login")}
                        >
                            Log in
                        </Button>
                    </div>
                </div>

                <form className="space-y-3" onSubmit={handleAuthSubmit}>
                    {mode === "signup" ? (
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="First name"
                                autoComplete="given-name"
                                required
                                value={firstName}
                                onChange={(event) =>
                                    setFirstName(event.target.value)
                                }
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                            />
                            <input
                                type="text"
                                placeholder="Last name"
                                autoComplete="family-name"
                                required
                                value={lastName}
                                onChange={(event) =>
                                    setLastName(event.target.value)
                                }
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                            />
                        </div>
                    ) : null}

                    <input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                    />

                    <input
                        type="password"
                        placeholder={
                            mode === "signup"
                                ? "Create a password"
                                : "Enter your password"
                        }
                        autoComplete={
                            mode === "signup"
                                ? "new-password"
                                : "current-password"
                        }
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                    />

                    {errorMessage ? (
                        <p className="text-xs text-red-500">{errorMessage}</p>
                    ) : null}
                    {isSuccess ? (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            {successMessage}
                        </p>
                    ) : null}

                    <Button
                        type="submit"
                        className="w-full hover:cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {primaryButtonLabel}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>or</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full hover:cursor-pointer"
                    onClick={handleGoogleOauth}
                    disabled={isLoading}
                >
                    <FcGoogle className="mr-2 h-4 w-4" />
                    Continue with Google
                </Button>
            </DialogContent>
        </Dialog>
    );
};
