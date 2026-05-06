"use client";

import type { BillingInvoiceHistoryItem } from "../types";
import {
    formatInvoiceAmount,
    formatInvoiceDateTime,
    formatInvoiceReference,
    formatStatusLabel,
    statusBadgeClassName,
} from "../helpers";

interface InvoiceHistoryTableProps {
    invoices: BillingInvoiceHistoryItem[];
}

const InvoiceHistoryTable = ({ invoices }: InvoiceHistoryTableProps) => {
    if (invoices.length === 0) {
        return (
            <div className="rounded-2xl border border-border/60 bg-card/50 px-5 py-6">
                <p className="text-sm text-muted-foreground">
                    No invoices found in the past 12 months.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/50">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1.4fr_0.4fr] gap-3 border-b border-border/60 px-5 py-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                <span>Invoice</span>
                <span>Status</span>
                <span>Amount</span>
                <span>Created</span>
                <span className="text-right"> </span>
            </div>

            <div className="divide-y divide-border/60">
                {invoices.map((invoice, index) => (
                    <div
                        key={`${invoice.invoiceId}-${index}`}
                        className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1.4fr_0.4fr] items-center gap-3 px-5 py-4"
                    >
                        <p className="text-sm font-medium text-foreground">
                            {formatInvoiceReference(invoice.invoiceId, index)}
                        </p>

                        <span
                            className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-semibold ${statusBadgeClassName(invoice.status)}`}
                        >
                            {formatStatusLabel(invoice.status)}
                        </span>

                        <p className="text-sm text-foreground">
                            {formatInvoiceAmount(invoice)}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {formatInvoiceDateTime(invoice)}
                        </p>

                        <div className="text-right">
                            {invoice.viewUrl ? (
                                <a
                                    href={invoice.viewUrl}
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

export default InvoiceHistoryTable;
