import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const POST = async () => {
    try {
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
        const response = await fetch(`${backendUrl}/api/v1/billing/portal/session`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText || "Failed to create portal session" },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Error in billing portal session route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
