import Link from "next/link";
import {
    AlertTriangle,
    BarChart3,
    CreditCard,
    FileText,
    Gauge,
    Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SETTINGS_BILLING_MOCK } from "../mock-settings-data";

const formatCreditsAsCurrency = (credits: number): string =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(credits / 100);

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

const BillingSettingsPage = () => {
    const { credits, plan, invoices } = SETTINGS_BILLING_MOCK;
    const creditBalanceLabel = formatCreditsAsCurrency(credits.balance);

    return (
        <section className="space-y-10">
            <div className="space-y-6">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        {plan.name} · {plan.statusLabel}
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight">
                        Pay as you go
                    </h2>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <span>Credit balance</span>
                        <span
                            aria-hidden="true"
                            className="grid h-4 w-4 place-items-center rounded-full border border-muted-foreground/70 text-[10px] leading-none"
                        >
                            i
                        </span>
                    </div>
                    <p className="text-6xl font-light tracking-tight text-foreground">
                        {creditBalanceLabel}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {credits.nextRefreshLabel}. {plan.monthlyCredits.toLocaleString()} credits included monthly.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-xl px-5">
                        <Link href="/dashboard/billing">Add to credit balance</Link>
                    </Button>
                    <Button
                        type="button"
                        size="lg"
                        variant="secondary"
                        className="rounded-xl px-5"
                    >
                        Auto recharge settings
                    </Button>
                    <Button
                        type="button"
                        size="lg"
                        variant="secondary"
                        className="rounded-xl px-5"
                        disabled={!plan.manageEnabled}
                    >
                        Cancel plan
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-5 rounded-3xl border border-orange-500/35 bg-orange-500/10 px-5 py-5 text-orange-600 dark:text-orange-300 md:flex-row md:items-center md:justify-between md:px-8">
                <div className="flex gap-4">
                    <AlertTriangle className="mt-1 h-6 w-6 shrink-0" />
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                            Auto recharge is off
                        </h3>
                        <p className="max-w-4xl text-base leading-7">
                            When your credit balance reaches $0, website generation requests may stop working. Enable automatic recharge to keep your credit balance topped up.
                        </p>
                    </div>
                </div>
                <Button
                    type="button"
                    size="lg"
                    className="shrink-0 rounded-xl bg-orange-600 px-6 text-white hover:bg-orange-700"
                >
                    Setup auto recharge
                </Button>
            </div>

            <div className="grid w-full gap-x-14 gap-y-8 md:grid-cols-2">
                {BILLING_SHORTCUTS.map((item) => {
                    const Icon = item.icon;
                    const content = (
                        <>
                            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-border bg-muted/50 text-foreground/85">
                                <Icon className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 space-y-1">
                                <h3 className="text-xl font-semibold tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-base text-muted-foreground">
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
                                className="group flex items-center gap-5 rounded-2xl py-2 transition-colors hover:text-primary"
                            >
                                {content}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={item.title}
                            type="button"
                            className="group flex items-center gap-5 rounded-2xl py-2 text-left transition-colors hover:cursor-pointer hover:text-primary"
                        >
                            {content}
                        </button>
                    );
                })}
            </div>

            <div className="w-full rounded-2xl border border-border bg-card/40">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h3 className="text-lg font-semibold">Recent invoices</h3>
                        <p className="text-sm text-muted-foreground">
                            Latest billing activity for this workspace.
                        </p>
                    </div>
                    <Button variant="outline" size="sm">
                        View all
                    </Button>
                </div>
                <div className="divide-y divide-border">
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <p className="font-medium">{invoice.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    {invoice.dateLabel} · {invoice.statusLabel}
                                </p>
                            </div>
                            <p className="font-medium">{invoice.amountLabel}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BillingSettingsPage;
