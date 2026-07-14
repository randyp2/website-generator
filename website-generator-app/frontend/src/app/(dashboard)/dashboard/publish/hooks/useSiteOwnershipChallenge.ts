"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
    createSiteOwnershipChallenge,
    type SiteOwnershipChallenge,
} from "../lib/siteOwnershipVerification";

type ChallengeRequestStatus = "idle" | "loading" | "success" | "error";

export const useSiteOwnershipChallenge = () => {
    const [challenge, setChallenge] = useState<SiteOwnershipChallenge | null>(null);
    const [status, setStatus] = useState<ChallengeRequestStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const activeRequest = useRef<AbortController | null>(null);

    const reset = useCallback((): void => {
        activeRequest.current?.abort();
        activeRequest.current = null;
        setChallenge(null);
        setStatus("idle");
        setError(null);
    }, []);

    const createChallenge = useCallback(async (
        externalUrl: string,
    ): Promise<SiteOwnershipChallenge | null> => {
        activeRequest.current?.abort();
        const controller = new AbortController();
        activeRequest.current = controller;
        setStatus("loading");
        setError(null);

        try {
            const result = await createSiteOwnershipChallenge(
                externalUrl,
                controller.signal,
            );
            if (activeRequest.current !== controller) return null;
            setChallenge(result);
            setStatus("success");
            return result;
        } catch (requestError) {
            if (requestError instanceof Error && requestError.name === "AbortError") {
                return null;
            }
            if (activeRequest.current === controller) {
                setStatus("error");
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Unable to create website verification challenge",
                );
            }
            return null;
        } finally {
            if (activeRequest.current === controller) activeRequest.current = null;
        }
    }, []);

    useEffect(() => () => activeRequest.current?.abort(), []);

    return {
        challenge,
        status,
        error,
        createChallenge,
        reset,
    };
};
