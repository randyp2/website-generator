import { describe, expect, it } from "vitest";
import {
    formatHistoryAmount,
    normalizeCreditPurchase,
    normalizeInvoice,
    sortHistoryByRecency,
} from "./helpers";

describe("billing history helpers", () => {
    it("normalizes a ledger credit purchase with its catalog fallback price", () => {
        const item = normalizeCreditPurchase({
            ledgerEntryId: "ledger-1",
            checkoutSessionId: "cs_test",
            paymentStatus: "paid",
            priceKey: "CREDIT_PACK_SMALL",
            credits: 100,
            purchasedAt: "2026-07-18T05:00:00Z",
        });

        expect(item.kind).toBe("credit_purchase");
        expect(item.activityLabel).toBe("Small Pack · 100 credits");
        expect(item.status).toBe("paid");
        expect(formatHistoryAmount(item)).toBe("$29");
    });

    it("prefers the amount captured by the Checkout webhook", () => {
        const item = normalizeCreditPurchase({
            ledgerEntryId: "ledger-2",
            priceKey: "CREDIT_PACK_MEDIUM",
            credits: 500,
            amountPaid: 4900,
            currency: "usd",
        });

        expect(formatHistoryAmount(item)).toBe("$49.00");
    });

    it("sorts invoices and credit purchases as one activity stream", () => {
        const invoice = normalizeInvoice({
            invoiceId: "in_test",
            status: "paid",
            occurredAt: "2026-07-17T05:00:00Z",
        });
        const purchase = normalizeCreditPurchase({
            ledgerEntryId: "ledger-3",
            priceKey: "CREDIT_PACK_SMALL",
            purchasedAt: "2026-07-18T05:00:00Z",
        });

        expect(sortHistoryByRecency([invoice, purchase])).toEqual([
            purchase,
            invoice,
        ]);
    });
});
