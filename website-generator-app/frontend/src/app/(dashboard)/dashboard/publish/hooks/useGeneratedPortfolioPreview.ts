"use client";

import {
    usePreviewScreenshot,
    type PreviewScreenshotResult,
} from "./usePreviewScreenshot";

/** Requests and follows the active generated version's background screenshot. */
export const useGeneratedPortfolioPreview = (
    portfolioId: string | null,
    enabled: boolean,
): PreviewScreenshotResult => usePreviewScreenshot(
    portfolioId,
    portfolioId ? `/api/portfolio/${portfolioId}/preview-screenshot` : null,
    enabled,
    "Unable to generate the portfolio preview.",
);
