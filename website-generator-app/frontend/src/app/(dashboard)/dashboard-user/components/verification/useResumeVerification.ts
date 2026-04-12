"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ParsedResumeData } from "@/types/resume";

import type { ResumeFile } from "./verification.types";
import type { VerificationSubTab } from "./useVerificationSubTab";

// ─── Internal state shape ────────────────────────────────────────────

interface ResumeVerificationState {
    /** The locally-selected or hydrated resume file. `null` = upload gate. */
    resume: ResumeFile | null;

    /** True while the file is being uploaded to Supabase storage + backend. */
    isUploading: boolean;
    uploadError: string | null;

    /** True while the resume text is being parsed by the parse API. */
    isParsing: boolean;
    parsingError: string | null;

    /** Structured data returned by the resume parser. */
    parsedData: ParsedResumeData | null;

    /** True while the initial GET for an existing verification is in-flight. */
    isLoadingExisting: boolean;

    /** Whether a verification row already exists in the backend. */
    hasPersisted: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────

/**
 * Encapsulates all resume-verification state and side-effects:
 *
 * 1. **Hydration** — on mount, fetches any existing verification from the
 *    backend and pre-fills state so the user can pick up where they left off.
 * 2. **Upload** — sends the raw file to Supabase storage via the BFF route,
 *    then records the metadata in the backend.
 * 3. **Parse** — sends the file to `/api/resume/parse` and PATCHes the
 *    parsed result back to the backend.
 * 4. **Delete** — removes the backend row + storage object.
 *
 * All navigation between sub-tabs is delegated to the caller via `setActiveTab`.
 */
const useResumeVerification = (
    setActiveTab: (tab: VerificationSubTab) => void,
) => {
    const [state, setState] = useState<ResumeVerificationState>({
        resume: null,
        isUploading: false,
        uploadError: null,
        isParsing: false,
        parsingError: null,
        parsedData: null,
        isLoadingExisting: true,
        hasPersisted: false,
    });

    // Keep a ref to the current blob URL so we can revoke it on unmount
    // without re-running the cleanup effect on every resume change.
    const blobUrlRef = useRef<string | undefined>(undefined);
    blobUrlRef.current = state.resume?.url;

    useEffect(() => {
        return () => {
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        };
    }, []);

    // ── Hydrate existing verification on mount ───────────────────────

    useEffect(() => {
        const hydrate = async () => {
            try {
                const res = await fetch("/api/profile/resume-verification");
                if (!res.ok) return;

                const data = await res.json();
                if (!data) return;

                setState((prev) => ({
                    ...prev,
                    hasPersisted: true,
                    resume: {
                        name: data.originalFileName ?? "Resume",
                        size: data.fileSizeBytes
                            ? `${(data.fileSizeBytes / 1024).toFixed(1)} KB`
                            : "",
                        url: "",
                        file: new File([], data.originalFileName ?? "Resume"),
                    },
                    parsedData: data.parsedJson ?? null,
                }));
            } catch (error) {
                console.error(
                    "Failed to load existing resume verification:",
                    error,
                );
            } finally {
                setState((prev) => ({ ...prev, isLoadingExisting: false }));
            }
        };

        hydrate();
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────

    /** Called by <ResumeUploadGate> after the user selects a local file. */
    const handleResumeUploaded = useCallback(
        (file: ResumeFile) => {
            if (state.resume?.url) URL.revokeObjectURL(state.resume.url);

            setState((prev) => ({
                ...prev,
                resume: file,
                uploadError: null,
            }));
            setActiveTab("resume-review");
        },
        [state.resume?.url, setActiveTab],
    );

    /** Deletes the persisted row + storage object, then resets local state. */
    const handleResumeRemoved = useCallback(async () => {
        if (state.resume?.url) URL.revokeObjectURL(state.resume.url);

        if (state.hasPersisted) {
            try {
                await fetch("/api/profile/resume-verification", {
                    method: "DELETE",
                });
            } catch (error) {
                console.error("Failed to delete resume verification:", error);
            }
        }

        setState((prev) => ({
            ...prev,
            resume: null,
            parsedData: null,
            parsingError: null,
            hasPersisted: false,
            uploadError: null,
        }));
        setActiveTab("resume-review");
    }, [state.resume?.url, state.hasPersisted, setActiveTab]);

    /**
     * Sends the raw file to the parse API, then PATCHes the structured
     * result to the backend so it's available on the next page load.
     */
    const parseAndPersist = useCallback(async (file: File) => {
        setState((prev) => ({
            ...prev,
            isParsing: true,
            parsingError: null,
            parsedData: null,
        }));

        try {
            const formData = new FormData();
            formData.append("file", file);

            const parseRes = await fetch("/api/resume/parse?llmFallback=false", {
                method: "POST",
                body: formData,
            });

            if (!parseRes.ok) throw new Error("Failed to parse resume");

            const parseBody = await parseRes.json();

            if (parseBody.success && parseBody.data) {
                const parsed = parseBody.data as ParsedResumeData;
                setState((prev) => ({ ...prev, parsedData: parsed }));

                // Persist parsed data to the backend in the background.
                await fetch("/api/profile/resume-verification/parsed", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        extractedText: parsed.normalizedText ?? null,
                        parsedJson: parsed,
                    }),
                });
            }
        } catch (error) {
            console.error("Resume verification parsing failed:", error);
            setState((prev) => ({
                ...prev,
                parsingError:
                    "Failed to parse resume. You can add skills manually.",
            }));
        } finally {
            setState((prev) => ({ ...prev, isParsing: false }));
        }
    }, []);

    /**
     * Uploads the file to storage (if not already persisted), navigates to
     * the skill-review tab, and kicks off parsing in the background.
     */
    const handleContinueToSkillVerification = useCallback(async () => {
        if (!state.resume) return;

        // Already persisted from a prior session — just navigate forward.
        if (state.hasPersisted) {
            setActiveTab("skill-review");
            return;
        }

        setState((prev) => ({
            ...prev,
            isUploading: true,
            uploadError: null,
        }));

        try {
            const formData = new FormData();
            formData.append("file", state.resume.file);

            const res = await fetch(
                "/api/profile/resume-verification/upload",
                { method: "POST", body: formData },
            );

            if (!res.ok) {
                let message = "Failed to upload resume for verification";
                try {
                    const body = await res.json();
                    if (typeof body?.error === "string") message = body.error;
                } catch {
                    /* use default message */
                }
                throw new Error(message);
            }

            setState((prev) => ({ ...prev, hasPersisted: true }));

            // Navigate first so the user sees progress, then parse.
            setActiveTab("skill-review");
            parseAndPersist(state.resume.file);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to upload resume for verification";
            setState((prev) => ({ ...prev, uploadError: message }));
        } finally {
            setState((prev) => ({ ...prev, isUploading: false }));
        }
    }, [state.resume, state.hasPersisted, setActiveTab, parseAndPersist]);

    return {
        ...state,
        handleResumeUploaded,
        handleResumeRemoved,
        handleContinueToSkillVerification,
    } as const;
};

export default useResumeVerification;
