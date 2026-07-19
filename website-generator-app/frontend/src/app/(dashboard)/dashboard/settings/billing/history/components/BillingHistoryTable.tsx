"use client";

import type { BillingHistoryItem } from "../types";
import {
    formatHistoryAmount,
    formatHistoryDateTime,
    formatHistoryReference,
    formatStatusLabel,
    statusBadgeClassName,
} from "../helpers";

interface BillingHistoryTableProps {
    items: BillingHistoryItem[];
}

/** Renders subscription invoices and fulfilled credit-pack purchases together. */
const BillingHistoryTable = ({ items }: BillingHistoryTableProps) => {
    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-border/60 bg-card/50 px-5 py-6">
                <p className="text-sm text-muted-foreground">
                    No billing activity found in the past 12 months.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/50">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1.4fr_0.4fr] gap-3 border-b border-border/60 px-5 py-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                <span>Activity</span>
                <span>Status</span>
                <span>Amount</span>
                <span>Created</span>
                <span className="text-right"> </span>
            </div>

            <div className="divide-y divide-border/60">
                {items.map((item, index) => (
                    <div
                        key={item.id || `${item.kind}-${index}`}
                        className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1.4fr_0.4fr] items-center gap-3 px-5 py-4"
                    >
                        <p className="text-sm font-medium text-foreground">
                            {formatHistoryReference(item, index)}
                        </p>

                        <span
                            className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-semibold ${statusBadgeClassName(item.status)}`}
                        >
                            {formatStatusLabel(item.status)}
                        </span>

                        <p className="text-sm text-foreground">
                            {formatHistoryAmount(item)}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {formatHistoryDateTime(item)}
                        </p>

                        <div className="text-right">
                            {item.viewUrl ? (
                                <a
                                    href={item.viewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                                >
                                    View
                                </a>
                            ) : (
                                <span className="text-sm text-muted-foreground">
                                    --
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BillingHistoryTable;
