"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePublicAuthGate } from "@/context/PublicAuthGateContext";
import { useToast } from "@/hooks/useToast";
import { consumePersistedAuthIntent } from "@/lib/public-auth-intent-storage";
import type {
    BillingMode,
    CreateCheckoutSessionResponse,
    PriceKey,
} from "@/types/billing";
import { BillingModeTabs } from "./components/BillingModeTabs";
import { CreditPacksGrid } from "./components/CreditPacksGrid";
import { PolicyCopy } from "./components/PolicyCopy";
import { SubscriptionPlansGrid } from "./components/SubscriptionPlansGrid";
import { UsageTransparencySection } from "./components/UsageTransparencySection";

const INVERSE_LIGHT_LINES_MASK: string = [
    "radial-gradient(44% 90% at 50% 0%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 12%, rgba(0, 0, 0, 0.2) 24%, rgba(0, 0, 0, 0.88) 48%, rgba(0, 0, 0, 1) 64%)",
    "radial-gradient(140% 132% at 0% 0%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.14) 46%, rgba(0, 0, 0, 0.84) 66%, rgba(0, 0, 0, 1) 78%)",
    "radial-gradient(140% 132% at 100% 0%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.14) 46%, rgba(0, 0, 0, 0.84) 66%, rgba(0, 0, 0, 1) 78%)",
    "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 62%, rgba(0, 0, 0, 0.6) 84%, rgba(0, 0, 0, 0) 100%)",
].join(", ");

const VERTICAL_LINES_MASK_STYLE: React.CSSProperties = {
    maskImage: INVERSE_LIGHT_LINES_MASK,
    WebkitMaskImage: INVERSE_LIGHT_LINES_MASK,
    maskComposite: "intersect, intersect, intersect",
    WebkitMaskComposite: "source-in, source-in, source-in",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
};

interface ProfileMeBillingResponse {
    billing?: {
        activePriceKey?: PriceKey | null;
    } | null;
}

const BillingPageContent: React.FC = () => {
    const [mode, setMode] = useState<BillingMode>("subscription");
    const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
    const [activePriceKey, setActivePriceKey] = useState<PriceKey | null>(null);
    const { addToast } = useToast();
    const {
        authIntent,
        clearAuthIntent,
        isAuthReady,
        isAuthenticated,
        openAuthModal,
        requireAuth,
    } = usePublicAuthGate();

    const runCheckout = useCallback(
        async (priceKey: PriceKey): Promise<void> => {
            setIsCheckingOut(true);

            try {
                const response = await fetch("/api/billing/checkout/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ priceKey }),
                });

                if (response.status === 401) {
                    if (isAuthenticated) {
                        openAuthModal("pricing");
                        return;
                    }

                    openAuthModal("pricing", {
                        type: "pricing_checkout",
                        priceKey,
                    });
                    return;
                }

                if (!response.ok) {
                    const errorPayload =
                        ((await response.json().catch(() => null)) as
                            | { error?: string }
                            | null) ?? null;
                    throw new Error(
                        errorPayload?.error ??
                            "Unable to start checkout. Please try again.",
                    );
                }

                const data =
                    (await response.json()) as CreateCheckoutSessionResponse;

                if (!data.checkoutUrl) {
                    throw new Error(
                        "Checkout link was not returned. Please try again.",
                    );
                }

                window.location.assign(data.checkoutUrl);
            } catch (error) {
                addToast({
                    type: "error",
                    title: "Checkout unavailable",
                    description:
                        error instanceof Error
                            ? error.message
                            : "Unable to start checkout right now.",
                });
            } finally {
                setIsCheckingOut(false);
            }
        },
        [addToast, isAuthenticated, openAuthModal],
    );

    const handleCheckout = useCallback(
        (priceKey: PriceKey): void => {
            if (
                !requireAuth("pricing", {
                    type: "pricing_checkout",
                    priceKey,
                })
            ) {
                return;
            }

            void runCheckout(priceKey);
        },
        [requireAuth, runCheckout],
    );

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const pendingIntent = authIntent ?? consumePersistedAuthIntent();
        if (!pendingIntent) {
            return;
        }

        if (pendingIntent.type !== "pricing_checkout") {
            return;
        }

        clearAuthIntent();
        void runCheckout(pendingIntent.priceKey);
    }, [authIntent, clearAuthIntent, isAuthenticated, runCheckout]);

    useEffect(() => {
        if (!isAuthReady || !isAuthenticated) {
            setActivePriceKey(null);
            return;
        }

        let cancelled = false;
        void (async () => {
            try {
                const response = await fetch("/api/profile/me", {
                    method: "GET",
                });
                if (!response.ok) return;
                const data = (await response.json()) as ProfileMeBillingResponse;
                if (cancelled) return;
                setActivePriceKey(data.billing?.activePriceKey ?? null);
            } catch {
                // Silent failure: pricing buttons just stay enabled.
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isAuthReady, isAuthenticated]);

    return (
        <div className="relative px-4 pb-20 pt-0 md:px-6 md:pb-24 md:pt-0 [&_button]:cursor-pointer">
            <div className="relative z-10 mx-auto max-w-6xl space-y-12">
                <section className="relative pb-12 pt-0 md:pb-16 md:pt-0">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-0 z-20 h-[500px] w-screen -translate-x-1/2 overflow-hidden"
                    >
                        <div className="absolute inset-x-0 top-0 h-[240px] bg-[radial-gradient(92%_118%_at_50%_0%,rgba(204,125,35,0.46)_0%,rgba(204,125,35,0.2)_34%,rgba(204,125,35,0)_76%)] blur-xl" />
                        <div className="absolute inset-x-0 top-0 h-[210px] bg-[linear-gradient(to_bottom,rgba(204,125,35,0.14)_0%,rgba(204,125,35,0.05)_42%,rgba(204,125,35,0)_100%)]" />
                        <div className="absolute left-0 top-0 h-[460px] w-[30vw] min-w-[260px] bg-[radial-gradient(118%_126%_at_0%_0%,rgba(204,125,35,0.9)_0%,rgba(204,125,35,0.46)_34%,rgba(204,125,35,0)_72%)] blur-2xl" />
                        <div className="absolute right-0 top-0 h-[460px] w-[30vw] min-w-[260px] bg-[radial-gradient(118%_126%_at_100%_0%,rgba(204,125,35,0.9)_0%,rgba(204,125,35,0.46)_34%,rgba(204,125,35,0)_72%)] blur-2xl" />
                        <div className="absolute inset-x-0 top-0 h-[450px] bg-[radial-gradient(88%_128%_at_-8%_0%,rgba(204,125,35,0.18)_0%,rgba(204,125,35,0)_48%),radial-gradient(88%_128%_at_108%_0%,rgba(204,125,35,0.18)_0%,rgba(204,125,35,0)_48%)]" />
                        <div className="absolute inset-x-0 top-[40px] h-[360px] bg-[radial-gradient(44%_120%_at_0%_0%,rgba(204,125,35,0.2)_0%,rgba(204,125,35,0.06)_28%,rgba(204,125,35,0)_52%),radial-gradient(44%_120%_at_100%_0%,rgba(204,125,35,0.2)_0%,rgba(204,125,35,0.06)_28%,rgba(204,125,35,0)_52%)] blur-2xl" />
                    </div>

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-0 z-10 h-[300px] w-screen -translate-x-1/2 bg-[repeating-linear-gradient(to_right,transparent_0,transparent_78px,rgb(0_0_0/0.23)_78px,rgb(0_0_0/0.23)_79px)] dark:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_78px,rgb(255_255_255/0.3)_78px,rgb(255_255_255/0.3)_79px)] md:h-[320px]"
                        style={VERTICAL_LINES_MASK_STYLE}
                    />

                    <div className="relative z-30 pt-12 md:pt-16">
                        <div className="mx-auto max-w-2xl space-y-6 text-center">
                            <h2 className="text-center text-3xl font-semibold lg:text-4xl">
                                Pricing that scales with you
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Subscribe for monthly credits, or top up any
                                time with one-time packs.
                            </p>
                            <div className="flex justify-center">
                                <BillingModeTabs
                                    value={mode}
                                    onChange={setMode}
                                />
                            </div>
                        </div>

                        <div>
                            {mode === "subscription" ? (
                                <SubscriptionPlansGrid
                                    onCheckout={handleCheckout}
                                    disabled={isCheckingOut || !isAuthReady}
                                    activePriceKey={activePriceKey}
                                />
                            ) : (
                                <CreditPacksGrid
                                    onCheckout={handleCheckout}
                                    disabled={isCheckingOut || !isAuthReady}
                                />
                            )}
                        </div>
                    </div>
                </section>

                <UsageTransparencySection />
                <PolicyCopy />
            </div>
        </div>
    );
};

export default BillingPageContent;
