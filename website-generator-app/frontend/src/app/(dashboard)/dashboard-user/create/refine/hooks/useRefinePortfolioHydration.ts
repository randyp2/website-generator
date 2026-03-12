"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePortfolioStore } from "@/stores/usePortfolioStore";

interface LoadedPortfolioResponse {
    templateId?: string | null;
    sections?: unknown;
    globalTheme?: unknown;
}

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
                setGlobalTheme(data.globalTheme ?? null);
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
