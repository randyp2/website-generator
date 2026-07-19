"use client";

import {
    DEFAULT_SCRIPT_ID,
    SCRIPT_URL,
    Turnstile,
    type TurnstileInstance,
} from "@marsidev/react-turnstile";
import Script from "next/script";
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

import { cn } from "@/lib/utils";

export type TurnstileCaptchaHandle = {
    reset: () => void;
};

type TurnstileCaptchaProps = {
    action: "auth_login" | "auth_password_reset" | "auth_signup";
    className?: string;
    onTokenChange: (token: string | null) => void;
};

/**
 * Renders a managed Cloudflare Turnstile challenge and reports its short-lived
 * token to the owning authentication form.
 */
export const TurnstileCaptcha = forwardRef<
    TurnstileCaptchaHandle,
    TurnstileCaptchaProps
>(({ action, className, onTokenChange }, ref) => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
    const turnstileRef = useRef<TurnstileInstance | null>(null);
    const onTokenChangeRef = useRef(onTokenChange);
    const [hasLoadError, setHasLoadError] = useState<boolean>(false);

    useEffect(() => {
        onTokenChangeRef.current = onTokenChange;
    }, [onTokenChange]);

    const clearToken = useCallback(() => {
        onTokenChangeRef.current(null);
    }, []);

    const handleSuccess = useCallback((token: string) => {
        setHasLoadError(false);
        onTokenChangeRef.current(token);
    }, []);

    const handleLoadError = useCallback(() => {
        clearToken();
        setHasLoadError(true);
    }, [clearToken]);

    const scriptOptions = useMemo(
        () => ({ onError: handleLoadError }),
        [handleLoadError],
    );

    useImperativeHandle(
        ref,
        () => ({
            reset: () => {
                clearToken();
                turnstileRef.current?.reset();
            },
        }),
        [clearToken],
    );

    if (!siteKey) {
        return (
            <p
                role="alert"
                className={cn("text-xs text-red-500", className)}
            >
                Security check is temporarily unavailable. Please try again
                later.
            </p>
        );
    }

    return (
        <div className={cn("relative w-full", className)}>
            <Script
                id={DEFAULT_SCRIPT_ID}
                src={SCRIPT_URL}
                strategy="afterInteractive"
            />
            <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                injectScript={false}
                className="relative min-h-[65px] w-full"
                options={{
                    action,
                    theme: "auto",
                    size: "flexible",
                    refreshExpired: "auto",
                    refreshTimeout: "auto",
                    responseField: false,
                }}
                scriptOptions={scriptOptions}
                onSuccess={handleSuccess}
                onError={handleLoadError}
                onExpire={clearToken}
                onTimeout={clearToken}
                onUnsupported={handleLoadError}
            />
            {hasLoadError ? (
                <p role="alert" className="mt-1 text-xs text-red-500">
                    The security check could not load. Please refresh and try
                    again.
                </p>
            ) : null}
        </div>
    );
});

TurnstileCaptcha.displayName = "TurnstileCaptcha";
