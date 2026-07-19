"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import BillingHistoryTable from "./components/BillingHistoryTable";
import { fetchBillingHistory } from "./api";
import { filterHistoryWithinPastYear } from "./helpers";
import type { BillingHistoryItem } from "./types";

const BillingHistoryPage = () => {
    const [items, setItems] = useState<BillingHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const rows = await fetchBillingHistory({ limit: 100 });

                if (!cancelled) {
                    setItems(rows);
                }
            } catch (error) {
                if (!cancelled) {
                    setItems([]);
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "Unable to load billing history.",
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

    const itemsInPastYear = useMemo(
        () => filterHistoryWithinPastYear(items),
        [items],
    );

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        Billing history
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Credit purchases and subscription invoices from the
                        past year.
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
                <div className="rounded-2xl border border-border/60 bg-card/50 p-5 md:p-6">
                    <p className="text-sm text-muted-foreground">
                        Loading billing history...
                    </p>
                </div>
            ) : errorMessage ? (
                <div className="rounded-2xl border border-red-500/35 bg-red-500/10 p-5 md:p-6">
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {errorMessage}
                    </p>
                </div>
            ) : (
                <BillingHistoryTable items={itemsInPastYear} />
            )}
        </section>
    );
};

export default BillingHistoryPage;
