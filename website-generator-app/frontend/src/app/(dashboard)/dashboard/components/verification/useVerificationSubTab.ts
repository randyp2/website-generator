"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** All verification sub-tabs. The first three are sequential setup steps; evidence is a peer tab. */
export type VerificationSubTab =
    | "resume-review"
    | "skill-review"
    | "skill-verification"
    | "evidence";

const QUERY_KEY = "verificationTab";
/** Optional param carrying an evidence id to auto-open on the evidence tab. */
const EVIDENCE_QUERY_KEY = "evidence";
const DEFAULT_TAB: VerificationSubTab = "resume-review";

const isVerificationSubTab = (
    value: string | null,
): value is VerificationSubTab =>
    value === "resume-review" ||
    value === "skill-review" ||
    value === "skill-verification" ||
    value === "evidence";

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
    const hasExplicitTab = isVerificationSubTab(raw);
    const activeTab: VerificationSubTab = hasExplicitTab ? raw : DEFAULT_TAB;

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

    const targetEvidenceId = searchParams.get(EVIDENCE_QUERY_KEY);

    /** Switches to the evidence tab and flags an evidence item to auto-open. */
    const openEvidenceDetail = useCallback(
        (evidenceId: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(QUERY_KEY, "evidence");
            params.set(EVIDENCE_QUERY_KEY, evidenceId);
            router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
            });
        },
        [pathname, router, searchParams],
    );

    /** Clears the auto-open flag once the evidence tab has consumed it. */
    const clearTargetEvidence = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(EVIDENCE_QUERY_KEY);
        router.replace(`${pathname}?${params.toString()}`, {
            scroll: false,
        });
    }, [pathname, router, searchParams]);

    return {
        activeTab,
        setActiveTab,
        hasExplicitTab,
        targetEvidenceId,
        openEvidenceDetail,
        clearTargetEvidence,
    } as const;
};

export default useVerificationSubTab;
