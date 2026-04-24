"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type { GlobalTheme } from "@/types/portfolio";

interface LoadedPortfolioResponse {
    templateId?: string | null;
    sections?: unknown;
    globalTheme?: unknown;
}

const parseGlobalTheme = (value: unknown): GlobalTheme | null => {
    if (!value || typeof value !== "object") return null;

    const theme = value as {
        background?: unknown;
        textPrimary?: unknown;
        textSecondary?: unknown;
        accentColor?: unknown;
        fonts?: unknown;
    };

    if (
        typeof theme.background !== "string" ||
        typeof theme.textPrimary !== "string" ||
        typeof theme.textSecondary !== "string" ||
        typeof theme.accentColor !== "string"
    ) {
        return null;
    }

    let fonts: GlobalTheme["fonts"];
    if (theme.fonts !== undefined) {
        if (!theme.fonts || typeof theme.fonts !== "object") return null;
        const candidateFonts = theme.fonts as {
            heading?: unknown;
            body?: unknown;
        };

        if (
            typeof candidateFonts.heading !== "string" ||
            typeof candidateFonts.body !== "string"
        ) {
            return null;
        }

        fonts = {
            heading: candidateFonts.heading,
            body: candidateFonts.body,
        };
    }

    return {
        background: theme.background,
        textPrimary: theme.textPrimary,
        textSecondary: theme.textSecondary,
        accentColor: theme.accentColor,
        ...(fonts ? { fonts } : {}),
    };
};

export const useRefinePortfolioHydration = (): {
    isHydrating: boolean;
    hasResolvedInitialPortfolioLoad: boolean;
} => {
    const searchParams = useSearchParams();
    const {
        portfolioId,
        sections,
        setMessages,
        setPortfolioId,
        setTemplateId,
        setSections,
        setGlobalTheme,
    } = usePortfolioStore();

    const [isHydrating, setIsHydrating] = useState<boolean>(false);
    const [hasResolvedInitialPortfolioLoad, setHasResolvedInitialPortfolioLoad] =
        useState<boolean>(false);
    const lastLoadedIdRef = useRef<string | null>(null);

    useEffect((): void => {
        const portfolioIdParam = searchParams.get("portfolioId");

        if (!portfolioIdParam) {
            setHasResolvedInitialPortfolioLoad(true);
            return;
        }

        if (lastLoadedIdRef.current === portfolioIdParam) {
            setHasResolvedInitialPortfolioLoad(true);
            return;
        }

        lastLoadedIdRef.current = portfolioIdParam;

        if (portfolioId === portfolioIdParam && sections && sections.length > 0) {
            setHasResolvedInitialPortfolioLoad(true);
            return;
        }

        if (portfolioId !== portfolioIdParam) {
            setMessages([]);
        }

        fetch(`/api/portfolio/${portfolioIdParam}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_step: "refine" }),
        }).catch(() => null);

        const loadPortfolio = async (): Promise<void> => {
            setIsHydrating(true);
            setHasResolvedInitialPortfolioLoad(false);

            try {
                const response = await fetch(`/api/portfolio/${portfolioIdParam}/load`);
                const data = (await response.json()) as LoadedPortfolioResponse;

                if (!response.ok) {
                    console.error("Load portfolio error:", data);
                    return;
                }

                setPortfolioId(portfolioIdParam);
                setTemplateId(data.templateId ?? null);
                setSections(Array.isArray(data.sections) ? data.sections : []);
                setGlobalTheme(parseGlobalTheme(data.globalTheme));
            } catch (error: unknown) {
                console.error("Failed to load portfolio:", error);
            } finally {
                setIsHydrating(false);
                setHasResolvedInitialPortfolioLoad(true);
            }
        };

        void loadPortfolio();
    }, [
        searchParams,
        portfolioId,
        sections,
        setMessages,
        setPortfolioId,
        setTemplateId,
        setSections,
        setGlobalTheme,
    ]);

    return { isHydrating, hasResolvedInitialPortfolioLoad };
};
