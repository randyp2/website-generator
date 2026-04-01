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
    setIsParsingResume,
    setParsingError,
}: UseReviewPortfolioSyncParams) => {
    // Sync portfolioId from URL search params
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

    // If no parsed resume data exists, provide the manual template (no API call)
    useEffect(() => {
        if (!portfolioId || parsedResumeData || isParsingResume) return;

        setIsParsingResume(true);
        setParsingError(null);

        // Simulate brief loading, then provide manual template
        const timer = setTimeout(() => {
            setParsedResumeData(createManualResumeTemplate());
            setParsedResumeSourceKey(MANUAL_RESUME_SOURCE_KEY);
            setIsParsingResume(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [
        isParsingResume,
        parsedResumeData,
        portfolioId,
        setIsParsingResume,
        setParsedResumeData,
        setParsedResumeSourceKey,
        setParsingError,
    ]);
};
