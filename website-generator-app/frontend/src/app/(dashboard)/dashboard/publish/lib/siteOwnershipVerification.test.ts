import { afterEach, describe, expect, it, vi } from "vitest";

import {
    createSiteOwnershipChallenge,
    verifySiteOwnershipChallenge,
} from "./siteOwnershipVerification";

const challengePayload = {
    verificationId: "verification-1",
    verificationUrl: "https://example.com/",
    canonicalOrigin: "https://example.com",
    method: "HTML_META",
    status: "PENDING",
    verificationTag:
        "<meta name=\"portrn-site-verification\" content=\"wg_v1_token\">",
    challengeExpiresAt: "2026-07-14T20:00:00Z",
    verifiedAt: null,
};

describe("createSiteOwnershipChallenge", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("creates a challenge through the portfolio proxy", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            JSON.stringify(challengePayload),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        ));
        vi.stubGlobal("fetch", fetchMock);

        const result = await createSiteOwnershipChallenge("https://example.com");

        expect(result).toEqual(challengePayload);
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/portfolio/site-verifications",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ externalUrl: "https://example.com" }),
            }),
        );
    });

    it("surfaces the backend problem detail", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
            JSON.stringify({ detail: "externalUrl must use https" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        )));

        await expect(createSiteOwnershipChallenge("http://example.com"))
            .rejects.toThrow("externalUrl must use https");
    });

    it("rejects malformed backend success payloads", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
            JSON.stringify({ status: "PENDING" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        )));

        await expect(createSiteOwnershipChallenge("https://example.com"))
            .rejects.toThrow("Invalid verification response");
    });
});

describe("verifySiteOwnershipChallenge", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("checks the deployed website through the verification proxy", async () => {
        const verificationId = "123e4567-e89b-42d3-a456-426614174000";
        const verifiedPayload = {
            ...challengePayload,
            verificationId,
            status: "VERIFIED",
            verifiedAt: "2026-07-13T23:00:00Z",
        };
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            JSON.stringify(verifiedPayload),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        ));
        vi.stubGlobal("fetch", fetchMock);

        const result = await verifySiteOwnershipChallenge(verificationId);

        expect(result).toEqual(verifiedPayload);
        expect(fetchMock).toHaveBeenCalledWith(
            `/api/portfolio/site-verifications/${verificationId}/verify`,
            expect.objectContaining({ method: "POST" }),
        );
    });

    it("surfaces a missing deployed tag", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
            JSON.stringify({
                detail: "Verification tag was not found in the deployed page source",
            }),
            {
                status: 422,
                headers: { "Content-Type": "application/json" },
            },
        )));

        await expect(verifySiteOwnershipChallenge(
            "123e4567-e89b-42d3-a456-426614174000",
        )).rejects.toThrow(
            "Verification tag was not found in the deployed page source",
        );
    });
});
