// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { act, cleanup, render } from "@testing-library/react";
import { createRef, type ForwardedRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { resetWidgetMock, scriptPropsMock, turnstilePropsMock } = vi.hoisted(() => ({
    resetWidgetMock: vi.fn(),
    scriptPropsMock: vi.fn(),
    turnstilePropsMock: vi.fn(),
}));

vi.mock("next/script", () => ({
    default: (props: Record<string, unknown>) => {
        scriptPropsMock(props);
        return null;
    },
}));

vi.mock("@marsidev/react-turnstile", async () => {
    const React = await import("react");
    const MockTurnstile = React.forwardRef(
        (props: Record<string, unknown>, ref: ForwardedRef<unknown>) => {
            React.useImperativeHandle(ref, () => ({
                reset: resetWidgetMock,
            }));
            turnstilePropsMock(props);
            return React.createElement("div", {
                "data-testid": "managed-turnstile",
            });
        },
    );
    MockTurnstile.displayName = "MockTurnstile";

    return {
        DEFAULT_SCRIPT_ID: "cf-turnstile-script",
        SCRIPT_URL: "https://challenges.cloudflare.com/turnstile/v0/api.js",
        Turnstile: MockTurnstile,
    };
});

import {
    TurnstileCaptcha,
    type TurnstileCaptchaHandle,
} from "./TurnstileCaptcha";

type ManagedTurnstileProps = {
    injectScript: boolean;
    onSuccess: (token: string) => void;
    options: {
        action: string;
        responseField: boolean;
        size: string;
    };
    siteKey: string;
};

describe("TurnstileCaptcha", () => {
    const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "turnstile-site-key";
    });

    afterEach(() => {
        cleanup();
        if (originalSiteKey === undefined) {
            delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        } else {
            process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey;
        }
    });

    it("configures the managed widget, reports its token, and supports reset", () => {
        const onTokenChange = vi.fn();
        const captchaRef = createRef<TurnstileCaptchaHandle>();

        render(
            <TurnstileCaptcha
                ref={captchaRef}
                action="auth_login"
                onTokenChange={onTokenChange}
            />,
        );

        const turnstileProps = turnstilePropsMock.mock.lastCall?.[0] as
            | ManagedTurnstileProps
            | undefined;
        expect(turnstileProps).toMatchObject({
            injectScript: false,
            siteKey: "turnstile-site-key",
            options: {
                action: "auth_login",
                responseField: false,
                size: "flexible",
            },
        });
        expect(scriptPropsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "cf-turnstile-script",
                src: "https://challenges.cloudflare.com/turnstile/v0/api.js",
                strategy: "afterInteractive",
            }),
        );

        act(() => turnstileProps?.onSuccess("captcha-token"));
        expect(onTokenChange).toHaveBeenCalledWith("captcha-token");

        act(() => captchaRef.current?.reset());
        expect(onTokenChange).toHaveBeenLastCalledWith(null);
        expect(resetWidgetMock).toHaveBeenCalledOnce();
    });
});
