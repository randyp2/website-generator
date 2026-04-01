"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createMockPortfolioSnapshot } from "@/lib/mock-portfolios";
import { usePortfolioStore } from "@/stores/usePortfolioStore";

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

        const loadPortfolio = async (): Promise<void> => {
            setIsHydrating(true);
            setHasResolvedInitialPortfolioLoad(false);

            try {
                await new Promise((resolve) => window.setTimeout(resolve, 250));
                const data = createMockPortfolioSnapshot({
                    portfolioId: portfolioIdParam,
                    templateId: "developer-dark",
                });

                setPortfolioId(portfolioIdParam);
                setTemplateId(data.templateId ?? null);
                setSections(data.sections);
                setGlobalTheme(data.globalTheme ?? null);
            } catch (error: unknown) {
                console.error("Failed to load mock portfolio:", error);
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
