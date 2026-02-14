import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Get user JWT for backend authentication
        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
            error: authError,
        } = await supabase.auth.getSession();

        if (authError || !session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const token = session.access_token;

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
            return NextResponse.json(
                { error: "Backend URL not configured" },
                { status: 500 },
            );
        }

        const response = await fetch(
            `${backendUrl}/api/portfolio/style/chat`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Style chat backend error:", errorText);
            return NextResponse.json(
                { error: "Backend request failed" },
                { status: response.status },
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Style chat API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
