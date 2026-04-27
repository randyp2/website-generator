"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { USERNAME_DEBOUNCE_MS, USERNAME_PATTERN } from "../constants";
import { parseJsonSafely } from "../lib/onboarding-utils";
import {
    type UsernameAvailabilityResponse,
    type UsernameState,
} from "../types";

type UseUsernameAvailabilityParams = {
    username: string;
    isBootstrapping: boolean;
};

type UsernameRemoteState = UsernameState & {
    username: string;
};

export const useUsernameAvailability = ({
    username,
    isBootstrapping,
}: UseUsernameAvailabilityParams): UsernameState => {
    const requestIdRef = useRef(0);
    const [usernameState, setUsernameState] = useState<UsernameRemoteState>({
        username: "",
        status: "idle",
        reason: null,
    });
    const isUsernameEmpty = username.length === 0;
    const hasValidUsername = USERNAME_PATTERN.test(username);
    const shouldCheck = !isBootstrapping && !isUsernameEmpty && hasValidUsername;

    useEffect(() => {
        if (!shouldCheck) {
            return;
        }

        const currentRequestId = requestIdRef.current + 1;
        requestIdRef.current = currentRequestId;
        const controller = new AbortController();

        const timeoutId = window.setTimeout(async () => {
            setUsernameState({
                username,
                status: "checking",
                reason: null,
            });

            try {
                const response = await fetch(
                    `/api/profile/username-available?username=${encodeURIComponent(username)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        signal: controller.signal,
                    },
                );

                if (requestIdRef.current !== currentRequestId) return;

                if (!response.ok) {
                    setUsernameState({
                        username,
                        status: "unavailable",
                        reason: "error",
                    });
                    return;
                }

                const data =
                    await parseJsonSafely<UsernameAvailabilityResponse>(response);
                if (!data) {
                    setUsernameState({
                        username,
                        status: "unavailable",
                        reason: "error",
                    });
                    return;
                }

                if (data.available) {
                    setUsernameState({
                        username,
                        status: "available",
                        reason: "available",
                    });
                    return;
                }

                setUsernameState({
                    username,
                    status: "unavailable",
                    reason: data.reason ?? "taken",
                });
            } catch {
                if (requestIdRef.current !== currentRequestId) return;
                if (controller.signal.aborted) return;
                setUsernameState({
                    username,
                    status: "unavailable",
                    reason: "error",
                });
            }
        }, USERNAME_DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [shouldCheck, username]);

    return useMemo(() => {
        if (isBootstrapping || isUsernameEmpty) {
            return { status: "idle", reason: null };
        }

        if (!hasValidUsername) {
            return { status: "unavailable", reason: "invalid" };
        }

        if (usernameState.username !== username) {
            return { status: "checking", reason: null };
        }

        if (usernameState.status === "idle") {
            return { status: "checking", reason: null };
        }

        return {
            status: usernameState.status,
            reason: usernameState.reason,
        };
    }, [
        hasValidUsername,
        isBootstrapping,
        isUsernameEmpty,
        username,
        usernameState.reason,
        usernameState.status,
        usernameState.username,
    ]);
};
