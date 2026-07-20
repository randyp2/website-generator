import { getBackendUrl } from "@/lib/server-env";
import { NextRequest, NextResponse } from "next/server";

const getErrorDetails = (error: unknown): Record<string, unknown> => {
    if (!(error instanceof Error)) {
        return { message: String(error) };
    }

    const cause = error.cause;
    if (!(cause instanceof Error)) {
        return { name: error.name, message: error.message };
    }

    const systemCause = cause as Error & {
        code?: string;
        errno?: number;
        hostname?: string;
        syscall?: string;
    };

    return {
        name: error.name,
        message: error.message,
        cause: {
            name: systemCause.name,
            message: systemCause.message,
            code: systemCause.code,
            errno: systemCause.errno,
            hostname: systemCause.hostname,
            syscall: systemCause.syscall,
        },
    };
};

export const GET = async (req: NextRequest) => {
    const { searchParams } = req.nextUrl;
    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "12";
    const backendUrl = getBackendUrl();
    let targetUrl: URL;

    try {
        targetUrl = new URL(`${backendUrl}/api/v1/public/portfolio`);
    } catch (error) {
        console.error("[api/public/portfolio] BACKEND_URL is invalid", {
            error: getErrorDetails(error),
        });
        return NextResponse.json(
            { content: [], totalPages: 0, last: true },
            { status: 500 },
        );
    }

    targetUrl.searchParams.set("page", page);
    targetUrl.searchParams.set("size", size);
    const startedAt = Date.now();

    console.info("[api/public/portfolio] Requesting Spring backend", {
        backendOrigin: targetUrl.origin,
        backendPath: targetUrl.pathname,
        page,
        size,
    });

    try {
        const response = await fetch(targetUrl, {
            next: { revalidate: 5 },
        });
        const durationMs = Date.now() - startedAt;

        console.info("[api/public/portfolio] Spring backend responded", {
            backendOrigin: targetUrl.origin,
            status: response.status,
            durationMs,
        });

        if (!response.ok) {
            console.error(
                "[api/public/portfolio] Spring backend returned an error",
                {
                    backendOrigin: targetUrl.origin,
                    status: response.status,
                    statusText: response.statusText,
                    durationMs,
                },
            );
            return NextResponse.json(
                { content: [], totalPages: 0, last: true },
                { status: 500 },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("[api/public/portfolio] Spring backend request failed", {
            backendOrigin: targetUrl.origin,
            backendPath: targetUrl.pathname,
            durationMs: Date.now() - startedAt,
            error: getErrorDetails(error),
        });

        return NextResponse.json(
            { content: [], totalPages: 0, last: true },
            { status: 500 },
        );
    }
};
