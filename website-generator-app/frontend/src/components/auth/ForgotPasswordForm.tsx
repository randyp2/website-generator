"use client";

import { ArrowLeft, Loader2, Mail } from "lucide-react";
import {
    type FormEvent,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    TurnstileCaptcha,
    type TurnstileCaptchaHandle,
} from "@/components/auth/TurnstileCaptcha";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

type ForgotPasswordFormProps = {
    defaultEmail?: string;
    onBack: () => void;
};

const inputClassName =
    "peer h-10 w-full rounded-none border-b border-input bg-transparent px-0 text-sm outline-none placeholder:text-muted-foreground/60";

const underlineClassName =
    "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#cc7d23] transition-transform duration-500 ease-out peer-focus:scale-x-100";

const genericSuccessMessage =
    "If an account exists for that email, a password reset link has been sent.";

/** Requests a CAPTCHA-protected Supabase password recovery email. */
export const ForgotPasswordForm = ({
    defaultEmail = "",
    onBack,
}: ForgotPasswordFormProps) => {
    const emailId = useId();
    const supabase = useMemo(() => createClient(), []);
    const captchaRef = useRef<TurnstileCaptchaHandle | null>(null);
    const [email, setEmail] = useState<string>(defaultEmail);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [requestSent, setRequestSent] = useState<boolean>(false);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();
        if (isSending || !captchaToken) {
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
                email.trim(),
                {
                    redirectTo,
                    captchaToken,
                },
            );

            if (error) {
                setErrorMessage(
                    "Unable to send the reset email. Please try again.",
                );
                return;
            }

            setRequestSent(true);
        } catch {
            setErrorMessage(
                "Unable to send the reset email. Please try again.",
            );
        } finally {
            setCaptchaToken(null);
            captchaRef.current?.reset();
            setIsSending(false);
        }
    };

    if (requestSent) {
        return (
            <div className="space-y-4">
                <div
                    role="status"
                    className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-700 dark:text-emerald-300"
                >
                    <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{genericSuccessMessage}</p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full hover:cursor-pointer"
                    onClick={onBack}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                </Button>
            </div>
        );
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
                <label
                    htmlFor={emailId}
                    className="block text-xs font-medium text-muted-foreground"
                >
                    Email
                </label>
                <div className="relative">
                    <input
                        id={emailId}
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className={inputClassName}
                    />
                    <span aria-hidden="true" className={underlineClassName} />
                </div>
            </div>

            <TurnstileCaptcha
                ref={captchaRef}
                action="auth_password_reset"
                onTokenChange={setCaptchaToken}
            />

            {errorMessage ? (
                <p role="alert" className="text-xs text-red-500">
                    {errorMessage}
                </p>
            ) : null}

            <Button
                type="submit"
                className="w-full hover:cursor-pointer"
                disabled={isSending || !captchaToken}
            >
                {isSending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    "Send reset link"
                )}
            </Button>

            <Button
                type="button"
                variant="ghost"
                className="w-full hover:cursor-pointer"
                onClick={onBack}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
            </Button>
        </form>
    );
};
