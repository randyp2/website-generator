"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";

import {
    TurnstileCaptcha,
    type TurnstileCaptchaHandle,
} from "@/components/auth/TurnstileCaptcha";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";

/** Requests a CAPTCHA-protected Supabase password recovery email. */
export const PasswordResetRequest = () => {
    const { user } = useUser();
    const supabase = useMemo(() => createClient(), []);
    const captchaRef = useRef<TurnstileCaptchaHandle | null>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [requestSent, setRequestSent] = useState<boolean>(false);

    const handleOpenChange = (nextOpen: boolean): void => {
        setOpen(nextOpen);
        if (!nextOpen) {
            setCaptchaToken(null);
            setErrorMessage(null);
            setRequestSent(false);
        }
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();
        if (!captchaToken || isSending) {
            return;
        }

        setErrorMessage(null);
        setIsSending(true);

        const redirectTo = new URL(
            "/auth/reset-password",
            window.location.origin,
        ).toString();

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                user.email,
                {
                    redirectTo,
                    captchaToken,
                },
            );

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            setRequestSent(true);
        } catch {
            setErrorMessage("Unable to send the reset email. Please try again.");
        } finally {
            setCaptchaToken(null);
            captchaRef.current?.reset();
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Reset password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reset your password</DialogTitle>
                    <DialogDescription>
                        We will send a secure password reset link to {user.email}.
                    </DialogDescription>
                </DialogHeader>

                {requestSent ? (
                    <div className="space-y-4">
                        <p
                            role="status"
                            className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
                        >
                            Check your inbox for the password reset link.
                        </p>
                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() => handleOpenChange(false)}
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <TurnstileCaptcha
                            ref={captchaRef}
                            action="auth_password_reset"
                            onTokenChange={setCaptchaToken}
                        />

                        {errorMessage ? (
                            <p role="alert" className="text-sm text-red-500">
                                {errorMessage}
                            </p>
                        ) : null}

                        <DialogFooter>
                            <Button
                                type="submit"
                                className="hover:cursor-pointer"
                                disabled={!captchaToken || isSending}
                            >
                                {isSending ? "Sending..." : "Send reset email"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};
