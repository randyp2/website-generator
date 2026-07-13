"use client";

import type { JSX, ReactNode } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
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
import { login, signup, signInWithGoogle } from "@/lib/auth-actions";

type Mode = "login" | "signup";

type AuthInputProps = {
    name: string;
    type: "email" | "password" | "text";
    placeholder: string;
    autoComplete?: string;
    required?: boolean;
};

type SubmitButtonProps = {
    label: string;
    pendingLabel: string;
    icon: ReactNode;
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

const inputClassName =
    "w-full rounded-md border border-border bg-muted/80 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/70 focus:bg-card focus:ring-4 focus:ring-primary/10";

const AuthInput = ({
    name,
    type,
    placeholder,
    autoComplete,
    required = true,
}: AuthInputProps): JSX.Element => (
    <input
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={inputClassName}
    />
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
                className={`${inputClassName} pr-12`}
            />
            <button
                type="button"
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors hover:text-foreground hover:cursor-pointer"
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
}: SubmitButtonProps): JSX.Element => {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        >
            {pending ? pendingLabel : label}
            {!pending && icon}
        </button>
    );
};

const LoginFields = (): JSX.Element => (
    <form action={login} className="space-y-3.5">
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <AuthInput
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <PasswordField
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
            />
        </div>

        <div className="flex justify-end">
            <span className="text-sm text-muted-foreground">
                Forgot password?
            </span>
        </div>

        <SubmitButton
            label="Log in"
            pendingLabel="Logging in..."
            icon={<LogIn className="h-4 w-4" />}
        />
    </form>
);

const SignupFields = (): JSX.Element => (
    <form action={signup} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Name</label>
                <AuthInput
                    name="first-name"
                    type="text"
                    placeholder="Ava"
                    autoComplete="given-name"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <AuthInput
                    name="last-name"
                    type="text"
                    placeholder="Johnson"
                    autoComplete="family-name"
                />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <AuthInput
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <PasswordField
                name="password"
                placeholder="Create a password"
                autoComplete="new-password"
            />
        </div>

        <SubmitButton
            label="Create account"
            pendingLabel="Creating account..."
            icon={<UserPlus className="h-4 w-4" />}
        />
    </form>
);

const LandingAuthPanel = ({
    backAction,
}: {
    backAction?: ReactNode;
}): JSX.Element => {
    const [mode, setMode] = useState<Mode>("login");
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
                                    currentMode === "login"
                                        ? "signup"
                                        : "login",
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
                                {mode === "login"
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
                                {mode === "login"
                                    ? ""
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
                    {mode === "login" ? <LoginFields /> : <SignupFields />}

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
                            className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:cursor-pointer"
                        >
                            <FcGoogle className="h-5 w-5" />
                            Continue with Google
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LandingAuthPanel;
