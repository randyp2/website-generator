import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { generateRateLimit } from "@/lib/rate-limit/ratelimit";
import { acquireLock, releaseLock } from "@/lib/rate-limit/redis-lock";
import { getBackendUrlOrNull } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { request } from "undici";

type GenerateRequestBody = {
    templateId?: string;
    resume?: unknown;
    [key: string]: unknown;
};

type JsonShape = Record<string, unknown>;

const GENERATE_TIMEOUT_MS = 600_000;

const jsonError = (
    status: number,
    error: string,
    stage: string,
    headers?: HeadersInit,
) =>
    NextResponse.json(
        { error, stage },
        headers ? { status, headers } : { status },
    );

const isTimeoutError = (error: unknown): boolean => {
    const code =
        error && typeof error === "object" && "code" in error
            ? (error as { code: unknown }).code
            : undefined;
    return code === "UND_ERR_HEADERS_TIMEOUT" || code === "UND_ERR_BODY_TIMEOUT";
};

const parseJsonObject = (raw: string): JsonShape | null => {
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? (parsed as JsonShape) : {};
    } catch {
        return null;
    }
};

const fetchPortfolioAssets = async (
    backendUrl: string,
    portfolioId: string,
    token: string,
): Promise<object[]> => {
    try {
        const portfolioRes = await fetch(`${backendUrl}/api/v1/portfolio/${portfolioId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!portfolioRes.ok) return [];

        const portfolioData = await portfolioRes.json();
        return portfolioData?.assets ?? [];
    } catch (err) {
        console.warn("[generate] Failed to fetch portfolio assets:", err);
        return [];
    }
};

const callBackendGenerate = async (
    backendUrl: string,
    portfolioId: string,
    token: string,
    body: string,
): Promise<{ statusCode: number; responseBody: string }> => {
    const { statusCode, body: resBody } = await request(
        `${backendUrl}/api/v1/portfolio/${portfolioId}/generate`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body,
            headersTimeout: GENERATE_TIMEOUT_MS,
            bodyTimeout: GENERATE_TIMEOUT_MS,
        },
    );

    return { statusCode, responseBody: await resBody.text() };
};

export const POST = async (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => {
    // Cleanup state for lock release in finally.
    let lockKey: string | null = null;
    let lockAcquired = false;

    try {
        // 1) Parse and validate inputs.
        const body = (await req.json()) as GenerateRequestBody;
        const { id: portfolioId } = await context.params;
        if (!body?.resume || !body?.templateId) {
            console.warn("[generate] Validation failed: missing resume/templateId");
            return jsonError(
                400,
                "Resume and templateId are required for portfolio generation",
                "input_validation",
            );
        }

        // 2) Authenticate request.
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.warn("[generate] Auth failed while loading user", {
                hasUser: Boolean(user),
                userError: userError?.message,
            });
            return jsonError(401, "Unauthorized", "auth_user");
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.warn("[generate] Auth failed: missing session for user", { userId: user.id });
            return jsonError(401, "Session expired", "auth_session");
        }

        // 3) Enforce guardrails: rate limit and single-flight lock.
        const rateLimitKey: string = `generate:user:${user.id}`;
        const rateLimitResponse = await enforceRateLimit(generateRateLimit, rateLimitKey);
        if (rateLimitResponse) {
            console.warn("[generate] Rate limit rejected request", { userId: user.id });
            return jsonError(
                429,
                "Too many requests",
                "rate_limit",
                rateLimitResponse.headers,
            );
        }

        // --- Acquire lock for preventing concurrent requests
        lockKey = `generate:lock:user:${user.id}`;
        lockAcquired = await acquireLock(lockKey, 600);
        if (!lockAcquired) {
            console.warn("[generate] Lock acquisition failed", { userId: user.id });
            return jsonError(
                409,
                "Portfolio generation already in progress, must wait",
                "lock_acquire",
            );
        }

        // 4) Resolve backend target and build backend payload.
        const backendUrl = getBackendUrlOrNull();
        if (!backendUrl) {
            console.error("[generate] Missing backend config: BACKEND_URL");
            return jsonError(500, "BACKEND_URL not configured", "backend_config");
        }

        const token = session.access_token;
        const assets = await fetchPortfolioAssets(backendUrl, portfolioId, token);

        console.log("[generate] Calling backend API for portfolio generation...", {
            portfolioId,
            userId: user.id,
        });
        const requestBody = JSON.stringify({ ...body, assets });

        // 5) Call Spring backend and map transport failures.
        let backendResponse: { statusCode: number; responseBody: string };
        try {
            backendResponse = await callBackendGenerate(
                backendUrl,
                portfolioId,
                token,
                requestBody,
            );
        } catch (err) {
            console.error("[generate] Backend request failed:", {
                message: err instanceof Error ? err.message : String(err),
            });
            if (isTimeoutError(err)) {
                return jsonError(
                    504,
                    "Portfolio generation timed out. Please try again.",
                    "backend_timeout",
                );
            }
            throw err;
        }

        const { statusCode, responseBody } = backendResponse;
        console.log("[generate] Backend responded with status:", statusCode);
        console.log("[generate] Raw response body:", responseBody.slice(0, 500));

        // 6) Parse backend response and relay structured errors.
        const data = parseJsonObject(responseBody);
        if (!data) {
            console.error("[generate] Failed to parse response:", responseBody.slice(0, 500));
            return jsonError(502, "Invalid response from backend", "backend_parse");
        }

        if (statusCode < 200 || statusCode >= 300) {
            console.error("[generate] Backend error:", data);
            const backendErrorMessage =
                typeof data.error === "string" && data.error.trim().length > 0
                    ? data.error
                    : "Portfolio generation failed";
            return jsonError(
                statusCode,
                backendErrorMessage,
                "backend_error",
            );
        }

        const sectionCount = Array.isArray(data.sections)
            ? data.sections.length
            : 0;

        console.log(
            "[generate] Successfully received portfolio data with",
            sectionCount,
            "sections",
        );

        return NextResponse.json(data);
    } catch (err) {
        // 7) Last-resort catch for unexpected route failures.
        const errorMessage = err instanceof Error ? err.message : String(err);
        const errorName = err instanceof Error ? err.name : "Unknown";
        console.error("[generate] Portfolio generate request error:", {
            name: errorName,
            message: errorMessage,
            stack: err instanceof Error ? err.stack : undefined,
        });
        return jsonError(
            500,
            `Unexpected server error: ${errorMessage}`,
            "unexpected",
        );
    } finally {
        // 8) Cleanup must never throw.
        if (lockKey && lockAcquired) {
            try {
                await releaseLock(lockKey);
            } catch (releaseError) {
                console.error("[generate] Failed to release lock", {
                    lockKey,
                    error:
                        releaseError instanceof Error
                            ? releaseError.message
                            : String(releaseError),
                });
            }
        }
    }
};
