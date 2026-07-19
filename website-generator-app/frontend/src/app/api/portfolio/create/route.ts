import { NextResponse } from "next/server";

/**
 * Retired multipart upload boundary. Kept temporarily so stale clients receive
 * an explicit response instead of retrying a request that exceeds proxy limits.
 */
export const POST = () => NextResponse.json(
    { error: "This upload flow is no longer supported. Refresh and try again." },
    { status: 410 },
);
