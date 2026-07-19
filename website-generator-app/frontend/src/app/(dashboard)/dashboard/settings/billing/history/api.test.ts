import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchBillingHistory } from "./api";

describe("fetchBillingHistory", () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("merges invoices and ledger purchases in reverse chronological order", async () => {
        fetchMock.mockImplementation(async (input) => {
            const url = String(input);
            if (url.includes("credit-purchases")) {
                return Response.json([
                    {
                        ledgerEntryId: "ledger-1",
                        paymentStatus: "paid",
                        priceKey: "CREDIT_PACK_SMALL",
                        credits: 100,
                        purchasedAt: "2026-07-18T05:00:00Z",
                    },
                ]);
            }

            return Response.json([
                {
                    invoiceId: "in_test",
                    status: "paid",
                    amountPaid: 2400,
                    currency: "usd",
                    occurredAt: "2026-07-17T05:00:00Z",
                },
            ]);
        });

        const items = await fetchBillingHistory({ limit: 100 });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/billing/invoices?limit=100",
            { method: "GET", cache: "no-store" },
        );
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/billing/credit-purchases?limit=100",
            { method: "GET", cache: "no-store" },
        );
        expect(items.map((item) => item.kind)).toEqual([
            "credit_purchase",
            "invoice",
        ]);
    });

    it("surfaces a failed history source instead of silently hiding rows", async () => {
        fetchMock
            .mockResolvedValueOnce(Response.json([]))
            .mockResolvedValueOnce(
                Response.json(
                    { error: "Unable to read credit purchases" },
                    { status: 500 },
                ),
            );

        await expect(fetchBillingHistory()).rejects.toThrow(
            "Unable to read credit purchases",
        );
    });
});
