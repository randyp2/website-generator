import { describe, expect, it } from "vitest";
import {
    getBillingAccessLabel,
    getCompactBillingAccessLabel,
} from "./access-label";

describe("billing access labels", () => {
    it("shows a loading placeholder before the snapshot is available", () => {
        expect(getCompactBillingAccessLabel(null)).toBe("--");
    });

    it("shows Pro with purchased credits as secondary information", () => {
        const snapshot = {
            activePlanKey: "website_generator_pro",
            activePromotionKey: "launch_access_2026",
            creditBalance: 100,
        };

        expect(getBillingAccessLabel(snapshot)).toBe("Pro");
        expect(getCompactBillingAccessLabel(snapshot)).toBe("Pro · 100 cr");
    });

    it("keeps launch access visible without purchased credits", () => {
        const snapshot = {
            activePromotionKey: "launch_access_2026",
            creditBalance: 0,
        };

        expect(getBillingAccessLabel(snapshot)).toBe("Launch");
        expect(getCompactBillingAccessLabel(snapshot)).toBe("Launch");
    });

    it("does not mistake free verification allowances for launch access", () => {
        expect(getBillingAccessLabel({ creditBalance: 0 })).toBe("Free");
    });

    it("shows purchased credits for an otherwise free account", () => {
        expect(
            getCompactBillingAccessLabel({ creditBalance: 100 }),
        ).toBe("100 credits");
        expect(getCompactBillingAccessLabel({ creditBalance: 1 })).toBe(
            "1 credit",
        );
    });
});
