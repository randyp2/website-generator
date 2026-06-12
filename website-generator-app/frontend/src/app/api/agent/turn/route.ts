import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type AgentTurnErrorPayload = {
    code?: string;
    error?: string;
    message?: string;
};

const parseErrorBody = (rawErrorBody: string): AgentTurnErrorPayload | null => {
    try {
        return JSON.parse(rawErrorBody) as AgentTurnErrorPayload;
    } catch {
        return null;
    }
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
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

        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/v1/agent/turn`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const rawErrorBody = await response.text();
            console.error("Agent turn backend error:", rawErrorBody);

            const parsedError = parseErrorBody(rawErrorBody);
            const errorMessage =
                parsedError?.error?.trim() ||
                parsedError?.message?.trim() ||
                rawErrorBody.trim() ||
                "Agent turn request failed";

            return NextResponse.json(
                {
                    code:
                        parsedError?.code?.trim() ||
                        "AGENT_TURN_REQUEST_FAILED",
                    error: errorMessage,
                },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Agent turn API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
