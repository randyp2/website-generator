"use client";

import { useRouter } from "next/navigation";
import type { ParsedResumeData } from "@/types/resume";

interface UseReviewContinueParams {
    parsedResumeData: ParsedResumeData | null;
    portfolioId: string | null;
}

export const useReviewContinue = ({
    parsedResumeData,
    portfolioId,
}: UseReviewContinueParams) => {
    const router = useRouter();

    const handleContinue = async () => {
        if (!parsedResumeData || !portfolioId) {
            alert("Missing resume data");
            return;
        }

        try {
            const res = await fetch(`/api/portfolio/${portfolioId}/resume`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    parsedJson: parsedResumeData,
                    extractedText: parsedResumeData.normalizedText,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Failed to save resume data:", errorData);
                throw new Error(errorData.error || "Failed to save resume data");
            }

            await fetch(`/api/portfolio/${portfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ last_step: "refine" }),
            });

            router.push(`/dashboard-user/create/refine?portfolioId=${portfolioId}`);
        } catch (error) {
            console.error("Error saving resume data:", error);
            alert("Failed to save resume data. Please try again.");
        }
    };

    return { handleContinue };
};
