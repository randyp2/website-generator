import "server-only";

import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type ProxyMethod = "GET" | "POST" | "PATCH" | "DELETE";

type BackendProxyOptions = {
    method?: ProxyMethod;
    request?: Request;
    authenticated?: boolean;
};

const readRequestBody = async (
    request: Request | undefined,
    method: ProxyMethod,
): Promise<string | undefined> => {
    if (!request || method === "GET") return undefined;

    const body = await request.text();
    return body.length > 0 ? body : undefined;
};

const toProxyResponse = async (response: Response): Promise<NextResponse> => {
    const body = await response.text();
    const headers = new Headers();
    headers.set("cache-control", "no-store");

    if (!body) {
        return new NextResponse(null, {
            status: response.status,
            headers,
        });
    }

    const contentType = response.headers.get("content-type");
    if (contentType) {
        headers.set("content-type", contentType);
    }
    headers.set("cache-control", "no-store");

    return new NextResponse(body, {
        status: response.status,
        headers,
    });
};

export const proxyBackendRequest = async (
    path: string,
    options: BackendProxyOptions = {},
): Promise<NextResponse> => {
    const method = options.method ?? "GET";

    try {
        const headers = new Headers();

        if (options.authenticated) {
            const supabase = await createServerSupabaseClient();
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error || !session?.access_token) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }

            headers.set("Authorization", `Bearer ${session.access_token}`);
        }

        const body = await readRequestBody(options.request, method);
        if (body) {
            headers.set(
                "Content-Type",
                options.request?.headers.get("content-type") ?? "application/json",
            );
        }

        const response = await fetch(`${getBackendUrl()}${path}`, {
            method,
            headers,
            body,
            cache: "no-store",
        });

        return toProxyResponse(response);
    } catch (error) {
        console.error("Backend proxy request failed:", {
            method,
            path,
            error,
        });

        return NextResponse.json(
            { error: "Backend request failed" },
            { status: 502 },
        );
    }
};
