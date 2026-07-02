import { useCallback, useEffect, useRef, useState } from "react";

import { usePortfolioStore } from "@/stores/usePortfolioStore";

import { DEFAULT_TEMPLATE_ID } from "./style-chat-utils";

interface UseStyleChatDraftParams {
    routePortfolioId: string | null;
    templateId: string | null;
    onPortfolioCreated?: (portfolioId: string) => void;
}

/**
 * Owns the style-step portfolio id and draft creation lifecycle.
 */
export const useStyleChatDraft = ({
    routePortfolioId,
    templateId,
    onPortfolioCreated,
}: UseStyleChatDraftParams) => {
    const { setTemplateId, setPortfolioId } = usePortfolioStore();
    const [activePortfolioId, setActivePortfolioId] = useState<string | null>(
        routePortfolioId,
    );
    const createdDraftIdRef = useRef<string | null>(null);
    const draftCreationPromiseRef = useRef<Promise<string> | null>(null);

    useEffect(() => {
        setActivePortfolioId(routePortfolioId);
    }, [routePortfolioId]);

    useEffect(() => {
        if (templateId) {
            setTemplateId(templateId);
        }
        if (activePortfolioId) {
            setPortfolioId(activePortfolioId);
        }
    }, [activePortfolioId, setPortfolioId, setTemplateId, templateId]);

    useEffect(() => {
        if (!activePortfolioId) return;
        fetch(`/api/portfolio/${activePortfolioId}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_step: "style" }),
        }).catch(() => null);
    }, [activePortfolioId]);

    const ensurePortfolioDraft = useCallback(async (): Promise<string> => {
        if (activePortfolioId) return activePortfolioId;
        if (draftCreationPromiseRef.current) return draftCreationPromiseRef.current;

        const draftTemplateId = templateId?.trim() || DEFAULT_TEMPLATE_ID;

        draftCreationPromiseRef.current = (async () => {
            const response = await fetch("/api/portfolio/draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateId: draftTemplateId }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                throw new Error(errorBody?.error ?? "Failed to create draft");
            }

            const data = await response.json();
            const createdPortfolioId = data?.portfolio?.id;
            if (!createdPortfolioId || typeof createdPortfolioId !== "string") {
                throw new Error("Draft was created without a portfolio id");
            }

            createdDraftIdRef.current = createdPortfolioId;
            setTemplateId(draftTemplateId);
            setPortfolioId(createdPortfolioId);
            setActivePortfolioId(createdPortfolioId);
            onPortfolioCreated?.(createdPortfolioId);

            return createdPortfolioId;
        })();

        try {
            return await draftCreationPromiseRef.current;
        } finally {
            draftCreationPromiseRef.current = null;
        }
    }, [
        activePortfolioId,
        onPortfolioCreated,
        setPortfolioId,
        setTemplateId,
        templateId,
    ]);

    return {
        activePortfolioId,
        createdDraftIdRef,
        ensurePortfolioDraft,
    };
};
