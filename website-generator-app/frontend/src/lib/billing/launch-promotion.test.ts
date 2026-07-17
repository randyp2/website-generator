// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
    consumeLaunchWelcomePending,
    getLaunchWelcomeName,
    isLaunchPromotion,
    markLaunchWelcomePending,
} from "./launch-promotion";

describe("launch promotion welcome", () => {
    beforeEach(() => {
        window.sessionStorage.clear();
    });

    it("recognizes only the launch campaign", () => {
        expect(isLaunchPromotion("launch_access_2026")).toBe(true);
        expect(isLaunchPromotion("another_campaign")).toBe(false);
        expect(isLaunchPromotion(null)).toBe(false);
    });

    it("consumes a pending welcome only once", () => {
        markLaunchWelcomePending();

        expect(consumeLaunchWelcomePending()).toBe(true);
        expect(consumeLaunchWelcomePending()).toBe(false);
    });

    it("uses the onboarding first name with a safe fallback", () => {
        expect(getLaunchWelcomeName("  Robin Jane Smith ")).toBe("Robin");
        expect(getLaunchWelcomeName(" ")).toBe("friend");
        expect(getLaunchWelcomeName(null)).toBe("friend");
    });
});
