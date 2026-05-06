import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type CreateCheckoutSessionRequest = {
    priceKey: string;
};

const parseRequestBody = async (
    req: Request,
): Promise<CreateCheckoutSessionRequest | null> => {
    const body =
        ((await req.json().catch(() => null)) as
            | Partial<CreateCheckoutSessionRequest>
            | null) ?? null;

    if (!body || typeof body.priceKey !== "string" || !body.priceKey.trim()) {
        return null;
    }

    return { priceKey: body.priceKey.trim() };
};

export const POST = async (req: Request) => {
    try {
        const parsedRequest = await parseRequestBody(req);
        if (!parsedRequest) {
            return NextResponse.json(
                { error: "priceKey is required" },
                { status: 400 },
            );
        }

        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { data: userData, error: userError } = await supabase.auth.getUser(
            session.access_token,
        );
        if (userError || !userData?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const backendUrl = getBackendUrl();
        const response = await fetch(
            `${backendUrl}/api/v1/billing/checkout/session`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(parsedRequest),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText || "Failed to create checkout session" },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Error in billing checkout session route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
