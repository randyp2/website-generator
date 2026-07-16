"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const MINIMUM_PASSWORD_LENGTH = 8;

/** Updates the authenticated recovery user's password through Supabase Auth. */
export const ResetPasswordForm = () => {
    const supabase = useMemo(() => createClient(), []);
    const [password, setPassword] = useState<string>("");
    const [passwordConfirmation, setPasswordConfirmation] =
        useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();
        if (isSaving) {
            return;
        }

        if (password.length < MINIMUM_PASSWORD_LENGTH) {
            setErrorMessage(
                `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters.`,
            );
            return;
        }

        if (password !== passwordConfirmation) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setErrorMessage(null);
        setIsSaving(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            setPassword("");
            setPasswordConfirmation("");
            setIsComplete(true);
        } catch {
            setErrorMessage("Unable to update your password. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isComplete) {
        return (
            <div className="space-y-5 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Password updated
                    </h1>
                    <p role="status" className="text-sm text-muted-foreground">
                        Your new password is ready to use.
                    </p>
                </div>
                <Button asChild className="w-full">
                    <Link href="/dashboard/settings/security">
                        Return to security settings
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1 text-center">
                <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <KeyRound className="h-5 w-5" />
                </span>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Choose a new password
                </h1>
                <p className="text-sm text-muted-foreground">
                    Use at least {MINIMUM_PASSWORD_LENGTH} characters and avoid
                    reusing an old password.
                </p>
            </div>

            <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">
                    New password
                </label>
                <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={MINIMUM_PASSWORD_LENGTH}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="confirm-password"
                    className="text-sm font-medium"
                >
                    Confirm new password
                </label>
                <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={MINIMUM_PASSWORD_LENGTH}
                    required
                    value={passwordConfirmation}
                    onChange={(event) =>
                        setPasswordConfirmation(event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

            {errorMessage ? (
                <p role="alert" className="text-sm text-red-500">
                    {errorMessage}
                </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "Updating..." : "Update password"}
            </Button>
        </form>
    );
};
