"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import InvoiceHistoryTable from "./components/InvoiceHistoryTable";
import { fetchBillingInvoices } from "./api";
import { filterInvoicesWithinPastYear } from "./helpers";
import type { BillingInvoiceHistoryItem } from "./types";

const BillingHistoryPage = () => {
    const [invoices, setInvoices] = useState<BillingInvoiceHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const rows = await fetchBillingInvoices({ limit: 100 });

                if (!cancelled) {
                    setInvoices(rows);
                }
            } catch (error) {
                if (!cancelled) {
                    setInvoices([]);
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "Unable to load billing invoices.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const invoicesInPastYear = useMemo(
        () => filterInvoicesWithinPastYear(invoices),
        [invoices],
    );

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Billing history
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Past invoice activity synced from Stripe.
                    </p>
                </div>

                <Link
                    href="/dashboard/settings/billing"
                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                    Back
                </Link>
            </div>

            {isLoading ? (
                <div className="rounded-2xl border border-border/60 bg-card/50 px-5 py-6">
                    <p className="text-sm text-muted-foreground">
                        Loading invoices...
                    </p>
                </div>
            ) : errorMessage ? (
                <div className="rounded-2xl border border-red-500/35 bg-red-500/10 px-5 py-6">
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {errorMessage}
                    </p>
                </div>
            ) : (
                <InvoiceHistoryTable invoices={invoicesInPastYear} />
            )}
        </section>
    );
};

export default BillingHistoryPage;
