"use client";

import {
    usePreviewScreenshot,
    type PreviewScreenshotResult,
} from "./usePreviewScreenshot";

/** Requests and follows a verified external website's background screenshot. */
export const useExternalPortfolioPreview = (
    verificationId: string | null,
    enabled: boolean,
): PreviewScreenshotResult => usePreviewScreenshot(
    verificationId,
    verificationId
        ? `/api/portfolio/site-verifications/${verificationId}/preview-screenshot`
        : null,
    enabled,
    "The verified website preview could not be captured.",
);
