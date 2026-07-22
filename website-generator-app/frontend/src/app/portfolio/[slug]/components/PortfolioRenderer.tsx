"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";
import Script from "next/script";
import type { PublicPortfolioDTO, PublicSectionDTO } from "@/types/public-portfolio";
import { transpileSection } from "@/utils/transpileSection";
import SectionErrorBoundary from "./SectionErrorBoundary";

interface Props {
    portfolio: PublicPortfolioDTO;
}

type TailwindRuntimeStatus = "loading" | "ready" | "error";

const TAILWIND_CDN_URL = "https://cdn.tailwindcss.com";
const TAILWIND_LOAD_TIMEOUT_MS = 20_000;

// ---------------------------------------------------------------------------
// Theme helpers reused from the Sandpack Preview component
// ---------------------------------------------------------------------------

interface NormalizedTheme {
    background: string;
    textPrimary: string;
    textSecondary: string;
    accentColor: string;
    fonts?: { heading?: string; body?: string };
}

const DEFAULT_THEME: NormalizedTheme = {
    background: "bg-slate-900",
    textPrimary: "text-white",
    textSecondary: "text-slate-400",
    accentColor: "purple",
};

const normalizeTheme = (
    globalTheme: PublicPortfolioDTO["globalTheme"],
): NormalizedTheme => {
    if (!globalTheme) return DEFAULT_THEME;

    const background = globalTheme.background?.trim();
    const textPrimary = globalTheme.textPrimary?.trim();

    if (!background || !textPrimary) return DEFAULT_THEME;

    return {
        background,
        textPrimary,
        textSecondary:
            globalTheme.textSecondary?.trim() || DEFAULT_THEME.textSecondary,
        accentColor:
            globalTheme.accentColor?.trim() || DEFAULT_THEME.accentColor,
        fonts: globalTheme.fonts,
    };
};

/** Build a Google Fonts URL from the theme's font config. */
const buildGoogleFontsUrl = (
    fonts?: { heading?: string; body?: string },
): string | null => {
    if (!fonts) return null;

    const unique = [
        ...new Set([fonts.heading, fonts.body].filter(Boolean) as string[]),
    ];
    if (unique.length === 0) return null;

    const families = unique
        .map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`)
        .join("&");

    return `https://fonts.googleapis.com/css2?${families}&display=swap`;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a public portfolio's sections as native React components.
 *
 * Replaces the previous iframe-based approach by transpiling each section's
 * `reactSource` on the client and rendering them directly in the React tree.
 * Tailwind CSS is loaded via CDN script to style the AI-generated markup.
 */
const PortfolioRenderer = ({ portfolio }: Props) => {
    const [tailwindStatus, setTailwindStatus] =
        useState<TailwindRuntimeStatus>("loading");

    // Transpiled sections use browser APIs (window, document, canvas, etc.)
    // so we only render them after mount to avoid SSR hydration mismatches.
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    const handleTailwindReady = useCallback(() => {
        setTailwindStatus("ready");
    }, []);

    const handleTailwindError = useCallback(() => {
        setTailwindStatus("error");
    }, []);

    useEffect(() => {
        if (tailwindStatus !== "loading") return;

        const timeoutId = window.setTimeout(
            handleTailwindError,
            TAILWIND_LOAD_TIMEOUT_MS,
        );

        return () => window.clearTimeout(timeoutId);
    }, [handleTailwindError, tailwindStatus]);

    const theme = useMemo(
        () => normalizeTheme(portfolio.globalTheme),
        [portfolio.globalTheme],
    );

    const googleFontsUrl = useMemo(
        () => buildGoogleFontsUrl(theme.fonts),
        [theme.fonts],
    );

    const bodyFont = theme.fonts?.body || "Inter";
    const headingFont = theme.fonts?.heading || bodyFont;

    // Theme-dependent variables that AI-generated sections may reference.
    // These mirror the globals the backend HTML export sets on `window`.
    const themeScope = useMemo(
        () => ({
            fontFamily: `${bodyFont}, sans-serif`,
            headingFontFamily: `${headingFont}, sans-serif`,
            root: mounted ? document.getElementById("portfolio-root") : null,
        }),
        [mounted, bodyFont, headingFont],
    );

    // Sort sections by orderIndex, then transpile each one.
    // useMemo ensures we only re-transpile when sections actually change.
    const renderedSections = useMemo(() => {
        if (!mounted || tailwindStatus !== "ready") return null;

        const sorted = [...portfolio.sections].sort(
            (a, b) => a.orderIndex - b.orderIndex,
        );

        return sorted.map((section: PublicSectionDTO, index: number) => {
            const Component = transpileSection(section.reactSource, index, themeScope);

            return (
                <SectionErrorBoundary key={section.sectionKey} sectionIndex={index}>
                    <Component
                        content={section.contentJson}
                        data={section.contentJson}
                    />
                </SectionErrorBoundary>
            );
        });
    }, [mounted, portfolio.sections, tailwindStatus, themeScope]);

    return (
        <>
            {/* Tailwind CSS CDN. AI-generated sections use arbitrary classes
                that aren't in the app's source, so the build-time Tailwind
                compiler won't generate them. The CDN JIT engine does. */}
            <Script
                id="portrn-tailwind-runtime"
                src={TAILWIND_CDN_URL}
                strategy="afterInteractive"
                onLoad={handleTailwindReady}
                onReady={handleTailwindReady}
                onError={handleTailwindError}
            />

            {/* Google Fonts */}
            {googleFontsUrl && (
                <>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link
                        rel="preconnect"
                        href="https://fonts.gstatic.com"
                        crossOrigin="anonymous"
                    />
                    <link href={googleFontsUrl} rel="stylesheet" />
                </>
            )}

            {/* Font styles */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        body { font-family: '${bodyFont}', sans-serif; margin: 0; padding: 0; }
                        h1, h2, h3, h4, h5, h6 { font-family: '${headingFont}', sans-serif; }
                    `,
                }}
            />

            {/* Portfolio content */}
            <div id="portfolio-root" className={`min-h-screen ${theme.background}`}>
                <div className={theme.textPrimary}>
                    <main>
                        {tailwindStatus === "error" ? (
                            <div
                                role="alert"
                                style={{
                                    alignItems: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                    justifyContent: "center",
                                    minHeight: "100vh",
                                    padding: "2rem",
                                    textAlign: "center",
                                }}
                            >
                                <p>Portfolio styles could not be loaded.</p>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    style={{
                                        border: "1px solid currentColor",
                                        borderRadius: "0.5rem",
                                        cursor: "pointer",
                                        padding: "0.625rem 1rem",
                                    }}
                                >
                                    Reload portfolio
                                </button>
                            </div>
                        ) : renderedSections ? (
                            renderedSections
                        ) : (
                            <div
                                role="status"
                                style={{
                                    alignItems: "center",
                                    display: "flex",
                                    justifyContent: "center",
                                    minHeight: "100vh",
                                }}
                            >
                                Loading portfolio…
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default PortfolioRenderer;
