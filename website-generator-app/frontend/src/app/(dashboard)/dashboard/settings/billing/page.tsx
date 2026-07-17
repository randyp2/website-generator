"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
    AlertTriangle,
    BarChart3,
    CreditCard,
    FileText,
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
import { useProfileMeQuery } from "@/hooks/useProfileMeQuery";

const BILLING_SHORTCUTS = [
    {
        title: "Payment methods",
        description: "Add or change payment method",
        icon: CreditCard,
        action: "billing-portal",
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
        action: "billing-portal",
    },
    {
        title: "Pricing",
        description: "View pricing and FAQs",
        icon: BarChart3,
        href: "/pricing",
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
    portfolioGenerationAllowanceRemaining?: number | null;
    portfolioRefinementAllowanceRemaining?: number | null;
    assetVerificationAllowanceRemaining?: number | null;
    activePlanKey?: string | null;
    status?: string | null;
    currentPeriodEnd?: string | null;
    cancelAt?: string | null;
    cancelAtPeriodEnd?: boolean | null;
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
    const [isOpeningPortal, setIsOpeningPortal] = useState<boolean>(false);
    const { addToast } = useToast();
    const { data: profile } = useProfileMeQuery();
    const billingSnapshot =
        (profile?.billing as ProfileBillingSnapshot | null | undefined) ?? null;
    const creditBalance =
        typeof billingSnapshot?.creditBalance === "number"
            ? billingSnapshot.creditBalance
            : 0;
    const creditBalanceLabel = creditBalance.toLocaleString();
    const activePlanName =
        toPlanName(billingSnapshot?.activePlanKey) ?? "Free";
    const subscriptionStatusLabel =
        formatStatusLabel(billingSnapshot?.status) ?? "No active subscription";

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
            ? "Subscription allowances are used first. Purchased credits are used only when an allowance is unavailable."
            : "Purchase a plan for monthly allowances or a credit pack for general usage.";
    const showAllowances = Boolean(
        billingSnapshot?.activePlanKey ||
        billingSnapshot?.portfolioGenerationAllowanceRemaining ||
        billingSnapshot?.portfolioRefinementAllowanceRemaining ||
        billingSnapshot?.assetVerificationAllowanceRemaining,
    );

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
        <section className="space-y-6">
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
                    {showAllowances ? (
                        <div className="grid gap-2 pt-2 text-sm sm:grid-cols-3">
                            <div className="rounded-lg border border-border px-3 py-2">
                                <p className="text-xs text-muted-foreground">
                                    Generations
                                </p>
                                <p className="font-medium">
                                    {billingSnapshot?.portfolioGenerationAllowanceRemaining ?? 0}{" "}
                                    remaining
                                </p>
                            </div>
                            <div className="rounded-lg border border-border px-3 py-2">
                                <p className="text-xs text-muted-foreground">
                                    Refinements
                                </p>
                                <p className="font-medium">
                                    {billingSnapshot?.portfolioRefinementAllowanceRemaining ?? 0}{" "}
                                    remaining
                                </p>
                            </div>
                            <div className="rounded-lg border border-border px-3 py-2">
                                <p className="text-xs text-muted-foreground">
                                    Verifications
                                </p>
                                <p className="font-medium">
                                    {billingSnapshot?.assetVerificationAllowanceRemaining ?? 0}{" "}
                                    remaining
                                </p>
                            </div>
                        </div>
                    ) : null}
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

            <div className="grid w-full gap-1 md:grid-cols-2">
                {BILLING_SHORTCUTS.map((item) => {
                    const Icon = item.icon;
                    const opensBillingPortal =
                        "action" in item && item.action === "billing-portal";
                    const content = (
                        <>
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg text-foreground/60 transition-colors group-hover:text-primary">
                                <Icon className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                                <h3 className="text-lg font-semibold tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
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
                                className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/40 hover:text-primary"
                            >
                                {content}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={item.title}
                            type="button"
                            disabled={opensBillingPortal && isOpeningPortal}
                            onClick={
                                opensBillingPortal
                                    ? () => {
                                          void openBillingPortal();
                                      }
                                    : undefined
                            }
                            className="group flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors hover:cursor-pointer hover:bg-muted/40 hover:text-primary"
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
