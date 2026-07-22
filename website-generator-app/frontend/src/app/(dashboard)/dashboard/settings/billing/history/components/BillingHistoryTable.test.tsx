// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { normalizeCreditPurchase, normalizeInvoice } from "../helpers";
import BillingHistoryTable from "./BillingHistoryTable";

describe("BillingHistoryTable", () => {
    afterEach(cleanup);

    it("renders a fulfilled credit pack alongside a subscription invoice", () => {
        const purchase = normalizeCreditPurchase({
            ledgerEntryId: "ledger-1",
            paymentStatus: "paid",
            priceKey: "CREDIT_PACK_SMALL",
            credits: 100,
            purchasedAt: "2026-07-18T05:00:00Z",
        });
        const invoice = normalizeInvoice({
            invoiceId: "in_subscription",
            status: "paid",
            amountPaid: 2400,
            currency: "usd",
            hostedInvoiceUrl: "https://invoice.stripe.test/in_subscription",
            occurredAt: "2026-07-17T05:00:00Z",
        });

        render(<BillingHistoryTable items={[purchase, invoice]} />);

        expect(screen.getByText("Small Pack · 100 credits")).toBeVisible();
        expect(screen.getByText("$29")).toBeVisible();
        expect(screen.getByText("$24.00")).toBeVisible();
        expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
            "href",
            "https://invoice.stripe.test/in_subscription",
        );
    });

    it("shows a billing activity empty state", () => {
        render(<BillingHistoryTable items={[]} />);

        expect(
            screen.getByText("No billing activity found in the past 12 months."),
        ).toBeVisible();
    });
});
