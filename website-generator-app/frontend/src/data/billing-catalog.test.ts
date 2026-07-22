import { describe, expect, it } from "vitest";

import { CREDIT_PACKS } from "./billing-catalog";

describe("billing catalog", () => {
    it("publishes the GPT-5.6 credit pack prices", () => {
        expect(
            CREDIT_PACKS.map(({ priceKey, credits, priceLabel }) => ({
                priceKey,
                credits,
                priceLabel,
            })),
        ).toEqual([
            {
                priceKey: "CREDIT_PACK_SMALL",
                credits: 100,
                priceLabel: "$29",
            },
            {
                priceKey: "CREDIT_PACK_MEDIUM",
                credits: 500,
                priceLabel: "$119",
            },
            {
                priceKey: "CREDIT_PACK_LARGE",
                credits: 2000,
                priceLabel: "$399",
            },
        ]);
    });
});
