"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** The three sequential steps of the resume verification workflow. */
export type VerificationSubTab =
    | "resume-review"
    | "skill-review"
    | "skill-verification";

const QUERY_KEY = "verificationTab";
const DEFAULT_TAB: VerificationSubTab = "resume-review";

const isVerificationSubTab = (
    value: string | null,
): value is VerificationSubTab =>
    value === "resume-review" ||
    value === "skill-review" ||
    value === "skill-verification";

/**
 * Manages the active verification sub-tab via a URL query parameter.
 *
 * The tab value is kept in `?verificationTab=<tab>` so the user can
 * deep-link or refresh without losing their place.
 */
const useVerificationSubTab = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const raw = searchParams.get(QUERY_KEY);
    const activeTab: VerificationSubTab = isVerificationSubTab(raw)
        ? raw
        : DEFAULT_TAB;

    const setActiveTab = useCallback(
        (nextTab: VerificationSubTab) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(QUERY_KEY, nextTab);
            router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
            });
        },
        [pathname, router, searchParams],
    );

    return { activeTab, setActiveTab } as const;
};

export default useVerificationSubTab;
