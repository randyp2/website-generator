import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    createServerSupabaseClientMock,
    fetchBackendMock,
    getSessionMock,
    getUserMock,
} = vi.hoisted(() => ({
    createServerSupabaseClientMock: vi.fn(),
    fetchBackendMock: vi.fn(),
    getSessionMock: vi.fn(),
    getUserMock: vi.fn(),
}));

vi.mock("@/lib/api/backendFetch", () => ({
    fetchBackend: fetchBackendMock,
}));
vi.mock("@/utils/supabase/server", () => ({
    createServerSupabaseClient: createServerSupabaseClientMock,
}));

import { POST as createCheckoutSession } from "./checkout/session/route";
import { GET as listCreditPurchases } from "./credit-purchases/route";
import { GET as listInvoices } from "./invoices/route";
import { POST as createPortalSession } from "./portal/session/route";

describe("billing API routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createServerSupabaseClientMock.mockResolvedValue({
            auth: {
                getSession: getSessionMock,
                getUser: getUserMock,
            },
        });
        getSessionMock.mockResolvedValue({
            data: { session: { access_token: "access-token" } },
            error: null,
        });
        getUserMock.mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
        });
    });

    it("creates checkout through the authenticated backend helper", async () => {
        fetchBackendMock.mockResolvedValue(
            Response.json({ checkoutUrl: "https://checkout.stripe.test/session" }),
        );
        const request = new Request(
            "http://localhost/api/billing/checkout/session",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceKey: "CREDIT_PACK_SMALL" }),
            },
        );

        const response = await createCheckoutSession(request);

        expect(response.status).toBe(200);
        expect(fetchBackendMock).toHaveBeenCalledOnce();
        const [path, options] = fetchBackendMock.mock.calls[0] as [
            string,
            RequestInit,
        ];
        expect(path).toBe("/api/v1/billing/checkout/session");
        expect(options.method).toBe("POST");
        expect(new Headers(options.headers).get("Authorization")).toBe(
            "Bearer access-token",
        );
        expect(options.body).toBe(
            JSON.stringify({ priceKey: "CREDIT_PACK_SMALL" }),
        );
    });

    it("returns a readable checkout error when Stripe is unavailable", async () => {
        fetchBackendMock.mockResolvedValue(
            Response.json(
                {
                    timestamp: "2026-07-21T04:26:18.147+00:00",
                    status: 502,
                    error: "Bad Gateway",
                    path: "/api/v1/billing/checkout/session",
                },
                { status: 502 },
            ),
        );
        const request = new Request(
            "http://localhost/api/billing/checkout/session",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceKey: "WEBSITE_GENERATOR_PRO_MONTHLY",
                }),
            },
        );

        const response = await createCheckoutSession(request);

        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({
            error: "Unable to start Stripe checkout. Please try again.",
        });
    });

    it("creates a portal session through the authenticated backend helper", async () => {
        fetchBackendMock.mockResolvedValue(
            Response.json({ portalUrl: "https://billing.stripe.test/session" }),
        );

        const response = await createPortalSession();

        expect(response.status).toBe(200);
        expect(fetchBackendMock).toHaveBeenCalledOnce();
        const [path, options] = fetchBackendMock.mock.calls[0] as [
            string,
            RequestInit,
        ];
        expect(path).toBe("/api/v1/billing/portal/session");
        expect(options.method).toBe("POST");
        expect(new Headers(options.headers).get("Authorization")).toBe(
            "Bearer access-token",
        );
    });

    it("lists invoices through the authenticated backend helper", async () => {
        fetchBackendMock.mockResolvedValue(Response.json([]));
        const request = new Request(
            "http://localhost/api/billing/invoices?limit=25",
        );

        const response = await listInvoices(request);

        expect(response.status).toBe(200);
        expect(fetchBackendMock).toHaveBeenCalledOnce();
        const [path, options] = fetchBackendMock.mock.calls[0] as [
            string,
            RequestInit,
        ];
        expect(path).toBe("/api/v1/billing/invoices?limit=25");
        expect(options.method).toBe("GET");
        expect(new Headers(options.headers).get("Authorization")).toBe(
            "Bearer access-token",
        );
    });

    it("lists credit purchases through the authenticated backend helper", async () => {
        fetchBackendMock.mockResolvedValue(Response.json([]));
        const request = new Request(
            "http://localhost/api/billing/credit-purchases?limit=25",
        );

        const response = await listCreditPurchases(request);

        expect(response.status).toBe(200);
        expect(fetchBackendMock).toHaveBeenCalledOnce();
        const [path, options] = fetchBackendMock.mock.calls[0] as [
            string,
            RequestInit,
        ];
        expect(path).toBe("/api/v1/billing/credit-purchases?limit=25");
        expect(options.method).toBe("GET");
        expect(new Headers(options.headers).get("Authorization")).toBe(
            "Bearer access-token",
        );
    });
});
