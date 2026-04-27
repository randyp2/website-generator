"use client";

import { useEffect } from "react";
import type { ParsedResumeData } from "@/types/resume";
import {
    createManualResumeTemplate,
    MANUAL_RESUME_SOURCE_KEY,
} from "@/utils/resume/manualResumeTemplate";

interface UseReviewPortfolioSyncParams {
    isParsingResume: boolean;
    portfolioId: string | null;
    parsedResumeData: ParsedResumeData | null;
    searchPortfolioId: string | null;
    setPortfolioId: (value: string) => void;
    setParsedResumeData: (value: ParsedResumeData | null) => void;
    setParsedResumeSourceKey: (value: string | null) => void;
    setTemplateId: (value: string) => void;
    setIsParsingResume: (value: boolean) => void;
    setParsingError: (value: string | null) => void;
    templateId: string | null;
}

export const useReviewPortfolioSync = ({
    isParsingResume,
    portfolioId,
    parsedResumeData,
    searchPortfolioId,
    setPortfolioId,
    setParsedResumeData,
    setParsedResumeSourceKey,
    setTemplateId,
    setIsParsingResume,
    setParsingError,
    templateId,
}: UseReviewPortfolioSyncParams) => {
    useEffect(() => {
        if (searchPortfolioId && searchPortfolioId !== portfolioId) {
            setParsedResumeData(null);
            setParsedResumeSourceKey(null);
            setParsingError(null);
            setPortfolioId(searchPortfolioId);
        }
    }, [
        portfolioId,
        searchPortfolioId,
        setParsedResumeData,
        setParsedResumeSourceKey,
        setParsingError,
        setPortfolioId,
    ]);

    useEffect(() => {
        if (!portfolioId) return;

        fetch(`/api/portfolio/${portfolioId}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_step: "review" }),
        }).catch(() => null);
    }, [portfolioId]);

    useEffect(() => {
        if (!portfolioId || parsedResumeData || isParsingResume) return;

        const loadResume = async () => {
            setIsParsingResume(true);
            setParsingError(null);

            try {
                const resumeRes = await fetch(`/api/portfolio/${portfolioId}/resume`);
                if (resumeRes.ok) {
                    const data = await resumeRes.json();
                    if (data?.parsedJson) {
                        setParsedResumeData(data.parsedJson);
                        setParsedResumeSourceKey(null);
                    } else {
                        setParsedResumeData(createManualResumeTemplate());
                        setParsedResumeSourceKey(MANUAL_RESUME_SOURCE_KEY);
                    }
                } else {
                    setParsedResumeData(createManualResumeTemplate());
                    setParsedResumeSourceKey(MANUAL_RESUME_SOURCE_KEY);
                }

                if (!templateId) {
                    const loadRes = await fetch(`/api/portfolio/${portfolioId}/load`);
                    if (loadRes.ok) {
                        const loadData = await loadRes.json();
                        if (loadData?.templateId) {
                            setTemplateId(loadData.templateId);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load resume data:", error);
                setParsedResumeData(createManualResumeTemplate());
                setParsedResumeSourceKey(MANUAL_RESUME_SOURCE_KEY);
                setParsingError("We couldn't load a resume, so we opened a manual starter template instead.");
            } finally {
                setIsParsingResume(false);
            }
        };

        void loadResume();
    }, [
        isParsingResume,
        parsedResumeData,
        portfolioId,
        setIsParsingResume,
        setParsedResumeData,
        setParsedResumeSourceKey,
        setParsingError,
        setTemplateId,
        templateId,
    ]);
};
