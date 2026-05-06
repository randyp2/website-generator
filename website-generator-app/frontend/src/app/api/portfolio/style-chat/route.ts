import { getBackendUrl } from "@/lib/server-env";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";

type StyleChatErrorPayload = {
    code?: string;
    error?: string;
    message?: string;
};

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

        const backendUrl = getBackendUrl();

        const response = await fetch(
            `${backendUrl}/api/v1/portfolio/style/chat`,
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
            const rawErrorBody = await response.text();
            console.error("Style chat backend error:", rawErrorBody);

            let parsedError: StyleChatErrorPayload | null = null;
            try {
                parsedError = JSON.parse(rawErrorBody) as StyleChatErrorPayload;
            } catch {
                parsedError = null;
            }

            const errorMessage =
                parsedError?.error?.trim() ||
                parsedError?.message?.trim() ||
                (rawErrorBody?.trim()
                    ? rawErrorBody.trim()
                    : "Style chat request failed");

            const errorCode =
                response.status === 402
                    ? "INSUFFICIENT_CREDITS"
                    : parsedError?.code?.trim() || "STYLE_CHAT_REQUEST_FAILED";

            return NextResponse.json(
                {
                    code: errorCode,
                    error: errorMessage,
                },
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
