"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
    AlertTriangle,
    BarChart3,
    CreditCard,
    FileText,
    Gauge,
    Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/useToast";
import { SETTINGS_BILLING_MOCK } from "../mock-settings-data";

const BILLING_SHORTCUTS = [
    {
        title: "Payment methods",
        description: "Add or change payment method",
        icon: CreditCard,
    },
    {
        title: "Billing history",
        description: "View past and current invoices",
        icon: FileText,
        href: "/dashboard/settings/billing/history",
    },
    {
        title: "Preferences",
        description: "Manage billing information",
        icon: Settings,
    },
    {
        title: "Usage limits",
        description: "Set monthly spend limits",
        icon: Gauge,
    },
    {
        title: "Pricing",
        description: "View pricing and FAQs",
        icon: BarChart3,
        href: "/dashboard/billing",
    },
] as const;

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
    "trialing",
    "active",
    "past_due",
    "unpaid",
]);

const BILLING_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

interface ProfileBillingSnapshot {
    creditBalance?: number | null;
    activePlanKey?: string | null;
    status?: string | null;
    currentPeriodEnd?: string | null;
    cancelAt?: string | null;
    cancelAtPeriodEnd?: boolean | null;
}

interface ProfileMeBillingResponse {
    billing?: ProfileBillingSnapshot | null;
}

interface CreatePortalSessionResponse {
    portalUrl?: string;
}

const formatBillingDate = (isoDate?: string | null): string | null => {
    if (!isoDate) {
        return null;
    }

    const parsedDate = new Date(isoDate);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return BILLING_DATE_FORMATTER.format(parsedDate);
};

const formatStatusLabel = (status?: string | null): string | null => {
    if (!status) {
        return null;
    }

    const normalized = status.trim().replaceAll("_", " ");
    if (!normalized) {
        return null;
    }

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const toPlanName = (planKey?: string | null): string | null => {
    if (!planKey) {
        return null;
    }

    if (planKey === "website_generator_pro") {
        return "PortRN Pro";
    }

    return planKey.replaceAll("_", " ");
};

const BillingSettingsPage = () => {
    const { plan } = SETTINGS_BILLING_MOCK;
    const [creditBalance, setCreditBalance] = useState<number>(0);
    const [billingSnapshot, setBillingSnapshot] =
        useState<ProfileBillingSnapshot | null>(null);
    const [isOpeningPortal, setIsOpeningPortal] = useState<boolean>(false);
    const { addToast } = useToast();
    const creditBalanceLabel = creditBalance.toLocaleString();
    const activePlanName = toPlanName(billingSnapshot?.activePlanKey) ?? plan.name;
    const subscriptionStatusLabel =
        formatStatusLabel(billingSnapshot?.status) ?? plan.statusLabel;

    const currentPeriodEndLabel = formatBillingDate(
        billingSnapshot?.currentPeriodEnd,
    );
    const cancelAtLabel = formatBillingDate(billingSnapshot?.cancelAt);
    const activeUntilLabel =
        cancelAtLabel ??
        (billingSnapshot?.cancelAtPeriodEnd ? currentPeriodEndLabel : null);
    const isActiveSubscription = ACTIVE_SUBSCRIPTION_STATUSES.has(
        (billingSnapshot?.status ?? "").toLowerCase(),
    );
    const showCancellationNotice =
        isActiveSubscription && activeUntilLabel != null;
    const currentPeriodEndSummary = currentPeriodEndLabel
        ? `Current billing period ends on ${currentPeriodEndLabel}.`
        : "No active billing period yet.";
    const creditsPolicySummary =
        billingSnapshot?.activePlanKey === "website_generator_pro"
            ? `${plan.monthlyCredits.toLocaleString()} plan credits are granted on paid subscription invoices.`
            : "Purchase a plan or credit pack to add credits.";

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            try {
                const response = await fetch("/api/profile/me", {
                    method: "GET",
                    cache: "no-store",
                });
                if (!response.ok) {
                    if (!cancelled) {
                        setCreditBalance(0);
                    }
                    return;
                }

                const data = (await response.json()) as ProfileMeBillingResponse;
                const nextBalance = data.billing?.creditBalance;

                if (!cancelled) {
                    setBillingSnapshot(data.billing ?? null);
                    setCreditBalance(
                        typeof nextBalance === "number" ? nextBalance : 0,
                    );
                }
            } catch {
                if (!cancelled) {
                    setBillingSnapshot(null);
                    setCreditBalance(0);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const openBillingPortal = async (): Promise<void> => {
        setIsOpeningPortal(true);

        try {
            const response = await fetch("/api/billing/portal/session", {
                method: "POST",
            });

            if (!response.ok) {
                const errorPayload =
                    ((await response.json().catch(() => null)) as
                        | { error?: string }
                        | null) ?? null;
                throw new Error(
                    errorPayload?.error ??
                        "Unable to open subscription manager right now.",
                );
            }

            const data =
                (await response.json()) as CreatePortalSessionResponse;

            if (!data.portalUrl) {
                throw new Error(
                    "Stripe portal link was not returned. Please try again.",
                );
            }

            window.location.assign(data.portalUrl);
        } catch (error) {
            addToast({
                type: "error",
                title: "Unable to open billing portal",
                description:
                    error instanceof Error
                        ? error.message
                        : "Please try again in a moment.",
            });
        } finally {
            setIsOpeningPortal(false);
        }
    };

    return (
        <section className="space-y-8">
            <div className="space-y-5">
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                        {activePlanName} · {subscriptionStatusLabel}
                    </p>
                </div>

                <div className="space-y-1">
                    <TooltipProvider delayDuration={120}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex w-fit cursor-default items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    <span>Credit balance</span>
                                    <span
                                        aria-label="Credit balance details"
                                        className="grid h-4 w-4 place-items-center rounded-full border border-muted-foreground/70 text-[9px] leading-none text-muted-foreground/90"
                                    >
                                        i
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent
                                side="right"
                                align="center"
                                sideOffset={10}
                                className="max-w-[320px] rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
                            >
                                Your credit balance is consumed as you use
                                the API. Visit the usage page to view a
                                breakdown of your consumption.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <p className="text-2xl font-light tracking-tight text-foreground">
                        {creditBalanceLabel} credits
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {currentPeriodEndSummary} {creditsPolicySummary}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        size="sm"
                        className="rounded-lg px-3"
                        disabled={isOpeningPortal}
                        onClick={() => {
                            void openBillingPortal();
                        }}
                    >
                        {isOpeningPortal
                            ? "Opening subscription manager..."
                            : "Manage subscription"}
                    </Button>
                </div>

                {showCancellationNotice ? (
                    <div className="flex gap-3 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-300" />
                        <div>
                            <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                                Subscription cancellation scheduled
                            </p>
                            <p className="text-xs text-red-700/90 dark:text-red-200">
                                Active until {activeUntilLabel}.
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="grid w-full gap-x-12 gap-y-6 md:grid-cols-2">
                {BILLING_SHORTCUTS.map((item) => {
                    const Icon = item.icon;
                    const content = (
                        <>
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-black/8 text-foreground/70 dark:bg-white/10">
                                <Icon className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 space-y-1">
                                <h3 className="text-base font-semibold tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        </>
                    );

                    if ("href" in item) {
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="group flex items-center gap-4 rounded-xl py-1.5 transition-colors hover:text-primary"
                            >
                                {content}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={item.title}
                            type="button"
                            className="group flex items-center gap-4 rounded-xl py-1.5 text-left transition-colors hover:cursor-pointer hover:text-primary"
                        >
                            {content}
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default BillingSettingsPage;
