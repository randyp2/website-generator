"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
} from "react";
import { FcGoogle } from "react-icons/fc";

import type {
    AuthIntent,
    AuthModalReason,
} from "@/context/PublicAuthGateContext";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { resolvePostLoginNextPath } from "@/lib/public-auth-intent-storage";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { TermsAgreementCheckbox } from "@/components/auth/TermsAgreementCheckbox";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import {
    TurnstileCaptcha,
    type TurnstileCaptchaHandle,
} from "@/components/auth/TurnstileCaptcha";

type Mode = "forgot" | "login" | "signup";

// Bump when the Terms/Privacy content materially changes so we can tell which
// version a user accepted at sign-up.
const TERMS_VERSION = "2026-07-12";

// Underline-only inputs. The static bottom border stays muted; the orange
// streak lives on the sibling span and animates in on focus.
const inputClassName =
    "peer h-10 w-full rounded-none border-b border-input bg-transparent px-0 text-sm outline-none placeholder:text-muted-foreground/60";

// Orange underline that streaks across on focus. Pure CSS: a scaleX transform
// from the left edge, driven by the input's focus state via peer-focus. No JS.
const underlineClassName =
    "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#cc7d23] transition-transform duration-500 ease-out peer-focus:scale-x-100";

const labelClassName =
    "block text-xs font-medium text-muted-foreground";

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
    intent: AuthIntent | null;
    onOpenChange: (open: boolean) => void;
};

export const PublicAuthModal = ({
    open,
    reason,
    intent,
    onOpenChange,
}: PublicAuthModalProps) => {
    const [mode, setMode] = useState<Mode>("signup");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<TurnstileCaptchaHandle | null>(null);
    const supabase = useMemo(() => createClient(), []);

    const copy = REASON_COPY[reason];
    const headerCopy =
        mode === "forgot"
            ? {
                  title: "Reset your password",
                  description:
                      "Enter your email and we will send you a secure reset link.",
              }
            : copy;
    const primaryButtonLabel = mode === "signup" ? copy.cta : "Log in";

    const resetState = () => {
        setErrorMessage(null);
        setIsSuccess(false);
        setSuccessMessage("");
    };

    const onModeChange = (nextMode: Mode) => {
        setMode(nextMode);
        setCaptchaToken(null);
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
        setAgreedToTerms(false);
        setErrorMessage(null);
        setIsSuccess(false);
        setSuccessMessage("");
        setCaptchaToken(null);
    }, [open, reason]);

    // Consent is required to create an account (email or Google), but not to
    // log an existing user back in.
    const needsTermsConsent = mode === "signup" && !agreedToTerms;

    const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoading) {
            return;
        }

        if (needsTermsConsent) {
            resetState();
            setErrorMessage(
                "Please agree to the Terms of Use and Privacy Policy to continue.",
            );
            return;
        }

        if (!captchaToken) {
            resetState();
            setErrorMessage("Please complete the security check to continue.");
            return;
        }

        resetState();
        setIsLoading(true);

        try {
            if (mode === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                    options: { captchaToken },
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
                    captchaToken,
                    data: {
                        full_name: fullName,
                        email: email.trim(),
                        // Record proof of consent: what was accepted and when.
                        terms_accepted: true,
                        terms_version: TERMS_VERSION,
                        terms_accepted_at: new Date().toISOString(),
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
            captchaRef.current?.reset();
            setIsLoading(false);
        }
    };

    const handleGoogleOauth = async () => {
        if (isLoading) {
            return;
        }

        // Consent is captured by the required checkbox before this button is
        // enabled. Supabase's OAuth start does not accept user metadata, so for
        // Google sign-ups the checked box is the record of assent.
        if (needsTermsConsent) {
            setErrorMessage(
                "Please agree to the Terms of Use and Privacy Policy to continue.",
            );
            return;
        }

        resetState();
        setIsLoading(true);

        try {
            const postLoginUrl = new URL(
                "/auth/post-login",
                window.location.origin,
            );
            postLoginUrl.searchParams.set(
                "next",
                resolvePostLoginNextPath(reason, intent),
            );

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: postLoginUrl.toString(),
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
                    <DialogTitle>{headerCopy.title}</DialogTitle>
                    <DialogDescription>
                        {headerCopy.description}
                    </DialogDescription>
                </DialogHeader>

                {mode !== "forgot" ? (
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
                                "relative z-10 h-8 w-24 rounded-full text-xs transition-colors hover:bg-transparent",
                                mode === "signup"
                                    ? "text-white hover:text-white"
                                    : "text-muted-foreground hover:text-foreground",
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
                                "relative z-10 h-8 w-24 rounded-full text-xs transition-colors hover:bg-transparent",
                                mode === "login"
                                    ? "text-white hover:text-white"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                            onClick={() => onModeChange("login")}
                        >
                            Log in
                        </Button>
                    </div>
                    </div>
                ) : null}

                {mode === "forgot" ? (
                    <ForgotPasswordForm
                        defaultEmail={email}
                        onBack={() => onModeChange("login")}
                    />
                ) : (
                    <form className="space-y-3" onSubmit={handleAuthSubmit}>
                    {mode === "signup" ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label
                                    htmlFor="auth-first-name"
                                    className={labelClassName}
                                >
                                    First name
                                </label>
                                <div className="relative">
                                    <input
                                        id="auth-first-name"
                                        type="text"
                                        placeholder="John"
                                        autoComplete="given-name"
                                        required
                                        value={firstName}
                                        onChange={(event) =>
                                            setFirstName(event.target.value)
                                        }
                                        className={inputClassName}
                                    />
                                    <span
                                        aria-hidden="true"
                                        className={underlineClassName}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label
                                    htmlFor="auth-last-name"
                                    className={labelClassName}
                                >
                                    Last name
                                </label>
                                <div className="relative">
                                    <input
                                        id="auth-last-name"
                                        type="text"
                                        placeholder="Doe"
                                        autoComplete="family-name"
                                        required
                                        value={lastName}
                                        onChange={(event) =>
                                            setLastName(event.target.value)
                                        }
                                        className={inputClassName}
                                    />
                                    <span
                                        aria-hidden="true"
                                        className={underlineClassName}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="space-y-1">
                        <label htmlFor="auth-email" className={labelClassName}>
                            Email
                        </label>
                        <div className="relative">
                            <input
                                id="auth-email"
                                type="email"
                                placeholder="johndoe@example.com"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                className={inputClassName}
                            />
                            <span
                                aria-hidden="true"
                                className={underlineClassName}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="auth-password"
                                className={labelClassName}
                            >
                                Password
                            </label>
                            {mode === "login" ? (
                                <button
                                    type="button"
                                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                                    onClick={() => onModeChange("forgot")}
                                >
                                    Forgot password?
                                </button>
                            ) : null}
                        </div>
                        <div className="relative">
                            <input
                                id="auth-password"
                                type="password"
                                placeholder={
                                    mode === "signup"
                                        ? "At least 8 characters"
                                        : "Enter your password"
                                }
                                autoComplete={
                                    mode === "signup"
                                        ? "new-password"
                                        : "current-password"
                                }
                                required
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                className={inputClassName}
                            />
                            <span
                                aria-hidden="true"
                                className={underlineClassName}
                            />
                        </div>
                    </div>

                    {mode === "signup" ? (
                        <TermsAgreementCheckbox
                            checked={agreedToTerms}
                            onCheckedChange={setAgreedToTerms}
                            className="pt-1"
                        />
                    ) : null}

                    <TurnstileCaptcha
                        key={mode}
                        ref={captchaRef}
                        action={
                            mode === "login" ? "auth_login" : "auth_signup"
                        }
                        onTokenChange={setCaptchaToken}
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
                        disabled={
                            isLoading || needsTermsConsent || !captchaToken
                        }
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
                )}

                {mode !== "forgot" ? (
                    <>
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
                            disabled={isLoading || needsTermsConsent}
                        >
                            <FcGoogle className="mr-2 h-4 w-4" />
                            Continue with Google
                        </Button>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};
