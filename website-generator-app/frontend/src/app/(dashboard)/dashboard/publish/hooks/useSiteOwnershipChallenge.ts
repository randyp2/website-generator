"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
    createSiteOwnershipChallenge,
    type SiteOwnershipChallenge,
    verifySiteOwnershipChallenge,
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

    const executeRequest = useCallback(
        async (
            request: (signal: AbortSignal) => Promise<SiteOwnershipChallenge>,
            fallbackMessage: string,
        ): Promise<SiteOwnershipChallenge | null> => {
            activeRequest.current?.abort();
            const controller = new AbortController();
            activeRequest.current = controller;
            setStatus("loading");
            setError(null);

            try {
                const result = await request(controller.signal);
                if (activeRequest.current !== controller) return null;
                setChallenge(result);
                setStatus("success");
                return result;
            } catch (requestError) {
                if (
                    requestError instanceof Error &&
                    requestError.name === "AbortError"
                ) {
                    return null;
                }
                if (activeRequest.current === controller) {
                    setStatus("error");
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : fallbackMessage,
                    );
                }
                return null;
            } finally {
                if (activeRequest.current === controller) {
                    activeRequest.current = null;
                }
            }
        },
        [],
    );

    const createChallenge = useCallback(
        (externalUrl: string): Promise<SiteOwnershipChallenge | null> =>
            executeRequest(
                (signal) => createSiteOwnershipChallenge(externalUrl, signal),
                "Unable to create website verification challenge",
            ),
        [executeRequest],
    );

    const verifyChallenge = useCallback(
        (): Promise<SiteOwnershipChallenge | null> => {
            if (!challenge) return Promise.resolve(null);
            return executeRequest(
                (signal) => verifySiteOwnershipChallenge(
                    challenge.verificationId,
                    signal,
                ),
                "Unable to verify the deployed website",
            );
        },
        [challenge, executeRequest],
    );

    useEffect(() => () => activeRequest.current?.abort(), []);

    return {
        challenge,
        status,
        error,
        createChallenge,
        verifyChallenge,
        reset,
    };
};
