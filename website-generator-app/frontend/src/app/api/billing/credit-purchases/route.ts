import { fetchBackend } from "@/lib/api/backendFetch";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const normalizeLimit = (rawValue: string | null): string | null => {
    if (!rawValue) {
        return null;
    }

    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return String(parsed);
};

/** Returns the authenticated user's fulfilled credit-pack ledger entries. */
export const GET = async (req: Request) => {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: userData, error: userError } = await supabase.auth.getUser(
            session.access_token,
        );
        if (userError || !userData?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const requestUrl = new URL(req.url);
        const limit = normalizeLimit(requestUrl.searchParams.get("limit"));
        const limitQuery = limit ? `?limit=${encodeURIComponent(limit)}` : "";
        const response = await fetchBackend(
            `/api/v1/billing/credit-purchases${limitQuery}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText || "Failed to fetch credit purchases" },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Error in billing credit purchases route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
