"use client";

import type { ChangeEventHandler, JSX, ReactNode } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LogIn,
    Moon,
    Sun,
    UserPlus,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import BrandWordmark from "@/components/branding/BrandWordmark";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { TermsAgreementCheckbox } from "@/components/auth/TermsAgreementCheckbox";
import { TurnstileCaptcha } from "@/components/auth/TurnstileCaptcha";
import { cn } from "@/lib/utils";
import { login, signup, signInWithGoogle } from "@/lib/auth-actions";

type Mode = "forgot" | "login" | "signup";

// Bump when the Terms/Privacy content materially changes so we can tell which
// version a user accepted at sign-up. Kept in sync with the auth modal.
const TERMS_VERSION = "2026-07-12";

type AuthInputProps = {
    name: string;
    type: "email" | "password" | "text";
    placeholder: string;
    autoComplete?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    required?: boolean;
    value?: string;
};

type SubmitButtonProps = {
    label: string;
    pendingLabel: string;
    icon: ReactNode;
    disabled?: boolean;
};

const panelStats = [
    {
        value: "41%",
        copy: "of recruiters say early-career roles are the hardest to evaluate quickly.",
    },
    {
        value: "76%",
        copy: "of hiring teams want stronger proof of execution before they reply.",
    },
] as const;

// Underline-only input. The static bottom border stays muted; the orange
// streak lives on the sibling span below and animates in on focus.
const inputClassName =
    "peer h-11 w-full rounded-none border-b border-input bg-transparent px-0 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none";

// Orange underline that streaks across on focus. Pure CSS: a scaleX transform
// from the left edge, driven by the input's focus state via peer-focus. No JS.
const underlineClassName =
    "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#cc7d23] transition-transform duration-500 ease-out peer-focus:scale-x-100";

const AuthInput = ({
    name,
    type,
    placeholder,
    autoComplete,
    onChange,
    required = true,
    value,
}: AuthInputProps): JSX.Element => (
    <div className="relative">
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            autoComplete={autoComplete}
            onChange={onChange}
            required={required}
            value={value}
            className={inputClassName}
        />
        <span aria-hidden="true" className={underlineClassName} />
    </div>
);

const PasswordField = ({
    name,
    placeholder,
    autoComplete,
}: Omit<AuthInputProps, "type">): JSX.Element => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                name={name}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required
                className={cn(inputClassName, "pr-10")}
            />
            <span aria-hidden="true" className={underlineClassName} />
            <button
                type="button"
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute inset-y-0 right-0 flex items-center pr-1 text-muted-foreground transition-colors hover:text-foreground hover:cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
};

const SubmitButton = ({
    label,
    pendingLabel,
    icon,
    disabled = false,
}: SubmitButtonProps): JSX.Element => {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending || disabled}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        >
            {pending ? pendingLabel : label}
            {!pending && icon}
        </button>
    );
};

const LoginFields = ({
    email,
    onEmailChange,
    onForgotPassword,
}: {
    email: string;
    onEmailChange: (email: string) => void;
    onForgotPassword: () => void;
}): JSX.Element => {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    return (
        <form action={login} className="space-y-3.5">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Email Address
                </label>
                <AuthInput
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Password
                </label>
                <PasswordField
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm text-muted-foreground transition-colors hover:cursor-pointer hover:text-primary"
                >
                    Forgot password?
                </button>
            </div>

            <input
                type="hidden"
                name="captcha_token"
                value={captchaToken ?? ""}
            />
            <TurnstileCaptcha
                action="auth_login"
                onTokenChange={setCaptchaToken}
            />

            <SubmitButton
                label="Log in"
                pendingLabel="Logging in..."
                icon={<LogIn className="h-4 w-4" />}
                disabled={!captchaToken}
            />
        </form>
    );
};

const SignupFields = ({
    agreedToTerms,
    onAgreedChange,
}: {
    agreedToTerms: boolean;
    onAgreedChange: (checked: boolean) => void;
}): JSX.Element => {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    return (
        <form action={signup} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        First Name
                    </label>
                    <AuthInput
                        name="first-name"
                        type="text"
                        placeholder="Ava"
                        autoComplete="given-name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Last Name
                    </label>
                    <AuthInput
                        name="last-name"
                        type="text"
                        placeholder="Johnson"
                        autoComplete="family-name"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Email Address
                </label>
                <AuthInput
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Password
                </label>
                <PasswordField
                    name="password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                />
            </div>

            <TermsAgreementCheckbox
                checked={agreedToTerms}
                onCheckedChange={onAgreedChange}
                className="pt-1"
            />

            {/* Carry consent into the server action so signup() can enforce and
                record it server-side. */}
            <input
                type="hidden"
                name="terms_accepted"
                value={agreedToTerms ? "true" : "false"}
            />
            <input type="hidden" name="terms_version" value={TERMS_VERSION} />
            <input
                type="hidden"
                name="captcha_token"
                value={captchaToken ?? ""}
            />

            <TurnstileCaptcha
                action="auth_signup"
                onTokenChange={setCaptchaToken}
            />

            <SubmitButton
                label="Create account"
                pendingLabel="Creating account..."
                icon={<UserPlus className="h-4 w-4" />}
                disabled={!agreedToTerms || !captchaToken}
            />
        </form>
    );
};

const LandingAuthPanel = ({
    backAction,
}: {
    backAction?: ReactNode;
}): JSX.Element => {
    const [mode, setMode] = useState<Mode>("login");
    const [loginEmail, setLoginEmail] = useState<string>("");
    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    useEffect(() => {
        const timer = window.setTimeout(() => setIsVisible(true), 180);

        return () => window.clearTimeout(timer);
    }, []);

    const themeMode = mounted && resolvedTheme === "light" ? "light" : "dark";
    const showResolvedTheme = mounted;

    return (
        <div
            className={`w-full max-w-xl transition-all duration-700 ease-out ${
                isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
            }`}
        >
            <div className="relative space-y-6 text-card-foreground">
                <div className="flex flex-col items-end gap-3">
                    <div className="flex w-full items-center justify-between">
                        {backAction ?? <div />}
                        <Link
                            href="/"
                            aria-label="PortRN home"
                            className="inline-flex items-center gap-2 xl:hidden"
                        >
                            <Image
                                src="/branding/portrn-logo.svg"
                                alt=""
                                width={32}
                                height={32}
                                className="size-8"
                            />
                            <BrandWordmark className="text-xl text-foreground" />
                        </Link>
                        <div className="inline-flex rounded-full border border-foreground bg-background/70 p-1">
                        <button
                            type="button"
                            onClick={() => setTheme("light")}
                            aria-label="Switch to light mode"
                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:cursor-pointer ${
                                showResolvedTheme && themeMode === "light"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground"
                            }`}
                        >
                            <Sun className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setTheme("dark")}
                            aria-label="Switch to dark mode"
                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:cursor-pointer ${
                                showResolvedTheme && themeMode === "dark"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground"
                            }`}
                        >
                            <Moon className="h-3.5 w-3.5" />
                        </button>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        <button
                            type="button"
                            onClick={() =>
                                setMode((currentMode) =>
                                    currentMode === "login" ? "signup" : "login",
                                )
                            }
                            className="font-semibold text-primary transition-colors hover:text-primary/80 hover:cursor-pointer"
                        >
                            {mode === "login" ? "Sign up" : "Log in"}
                        </button>
                        <span className="px-2 text-muted-foreground/60">|</span>
                        <Link
                            href="/explore"
                            className="font-medium text-[#f59e0b] transition-colors hover:text-[#fbbf24]"
                        >
                            Browse portfolios
                        </Link>
                    </p>
                </div>

                <div className="flex items-start gap-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                                {mode === "forgot" ? (
                                    "Reset your password"
                                ) : mode === "login"
                                    ? (
                                        <>
                                            Log in to{" "}
                                            <BrandWordmark className="text-3xl text-foreground" />
                                        </>
                                    )
                                    : (
                                        <>
                                            Create your{" "}
                                            <BrandWordmark className="text-3xl text-foreground" />{" "}
                                            account
                                        </>
                                    )}
                            </h2>
                            <p className="max-w-md text-sm leading-6 text-muted-foreground">
                                {mode === "forgot"
                                    ? "Enter your email and we will send you a secure reset link."
                                    : mode === "login"
                                      ? "Turn your resume into a customizable AI portfolio you can review, refine, and publish."
                                      : "Start with your resume, shape the design, and publish a recruiter-ready portfolio."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {panelStats.map((stat) => (
                        <div key={stat.value} className="py-1">
                            <p className="text-sm leading-6 text-muted-foreground">
                                <span className="float-left mr-3 bg-linear-to-r from-[#fbbf24] via-[#f59e0b] to-[#b45309] bg-clip-text text-4xl font-semibold leading-none text-transparent">
                                    {stat.value}
                                </span>
                                {stat.copy}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    {mode === "login" ? (
                        <LoginFields
                            email={loginEmail}
                            onEmailChange={setLoginEmail}
                            onForgotPassword={() => setMode("forgot")}
                        />
                    ) : mode === "signup" ? (
                        <SignupFields
                            agreedToTerms={agreedToTerms}
                            onAgreedChange={setAgreedToTerms}
                        />
                    ) : (
                        <ForgotPasswordForm
                            defaultEmail={loginEmail}
                            onBack={() => setMode("login")}
                        />
                    )}

                    {mode !== "forgot" ? (
                        <>
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
                                    Or continue with
                                </span>
                                <div className="h-px flex-1 bg-border" />
                            </div>

                            <form action={signInWithGoogle}>
                                <button
                                    type="submit"
                                    disabled={
                                        mode === "signup" && !agreedToTerms
                                    }
                                    className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <FcGoogle className="h-5 w-5" />
                                    Continue with Google
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </button>
                                <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
                                    Google Sign-In securely creates and
                                    authenticates your PortRN account.
                                </p>
                            </form>
                        </>
                    ) : null}
                </div>
                <footer className="flex items-center justify-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                    <Link
                        href="/privacy"
                        className="transition-colors hover:text-foreground"
                    >
                        Privacy Policy
                    </Link>
                    <span aria-hidden="true">·</span>
                    <Link
                        href="/terms"
                        className="transition-colors hover:text-foreground"
                    >
                        Terms of Service
                    </Link>
                </footer>
            </div>
        </div>
    );
};

export default LandingAuthPanel;
