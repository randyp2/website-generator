"use client";

import { useEffect, useRef } from "react";
import { ToastType } from "@/components/ui/toast";
import { isToastDismissed, useToast } from "@/hooks/useToast";
import type { ParsedResumeData } from "@/types/resume";

const getConfidenceVariant = (score: number): ToastType => {
    if (score >= 0.7) return "success";
    if (score >= 0.4) return "warning";
    return "error";
};

const getConfidenceLabel = (score: number): string => {
    if (score >= 0.7) return "High";
    if (score >= 0.4) return "Medium";
    return "Low";
};

const getParsingMethodLabel = (method: string): string => {
    switch (method) {
        case "llm":
            return "AI-Enhanced Parser";
        case "regex":
            return "Regex Parser";
        case "regex_low_confidence":
            return "Regex Parser (Low Confidence)";
        case "regex_low_quality":
            return "Regex Parser (Low Quality)";
        default:
            return method;
    }
};

interface UseReviewToastsParams {
    isParsingResume: boolean;
    parsedResumeData: ParsedResumeData | null;
    parsingError: string | null;
    portfolioId: string | null;
}

export const useReviewToasts = ({
    isParsingResume,
    parsedResumeData,
    parsingError,
    portfolioId,
}: UseReviewToastsParams) => {
    const { addToast } = useToast();
    const parsingCompleteToastShown = useRef(false);

    useEffect(() => {
        if (isParsingResume) {
            parsingCompleteToastShown.current = false;
        }
    }, [isParsingResume]);

    useEffect(() => {
        if (!parsedResumeData || isParsingResume || parsingCompleteToastShown.current) {
            return;
        }

        parsingCompleteToastShown.current = true;

        const toastKey = `toast_${portfolioId}_parsing_complete`;
        if (isToastDismissed(toastKey)) return;

        const confidence = parsedResumeData.confidenceScore ?? 0;
        const method = parsedResumeData.parsingMethod ?? "unknown";

        addToast({
            type: getConfidenceVariant(confidence),
            title: `Resume Parsed - ${Math.round(confidence * 100)}% Confidence`,
            description: `${getConfidenceLabel(confidence)} quality • ${getParsingMethodLabel(method)}`,
            dismissKey: toastKey,
        });
    }, [addToast, isParsingResume, parsedResumeData, portfolioId]);

    useEffect(() => {
        if (!parsingError || isParsingResume) return;

        const toastKey = `toast_${portfolioId}_parsing_error`;
        if (isToastDismissed(toastKey)) return;

        addToast({
            type: "error",
            title: "Parsing Failed",
            description: parsingError,
            dismissKey: toastKey,
        });
    }, [addToast, isParsingResume, parsingError, portfolioId]);
};
