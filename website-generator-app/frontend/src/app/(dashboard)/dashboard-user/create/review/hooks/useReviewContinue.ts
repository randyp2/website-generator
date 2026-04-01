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

        router.push(`/dashboard-user/create/refine?portfolioId=${portfolioId}`);
    };

    return { handleContinue };
};
