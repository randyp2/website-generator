"use client";

import { useEffect, useState } from "react";
import { SpiralLoader } from "@/components/ui/SpiralLoader";

const FLOWSTATE_THRESHOLD_SECONDS = 10;

const getElapsedSeconds = (startedAt: Date): number =>
    Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));

const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
        return remainingSeconds > 0
            ? `${minutes}m ${remainingSeconds}s`
            : `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

interface FlowStateStatusProps {
    startedAt: Date;
}

/**
 * Live refine status that starts as thinking, then switches to flowstate copy.
 */
export const FlowStateStatus = ({ startedAt }: FlowStateStatusProps) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(() =>
        getElapsedSeconds(startedAt),
    );

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setElapsedSeconds(getElapsedSeconds(startedAt));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [startedAt]);

    const statusText =
        elapsedSeconds >= FLOWSTATE_THRESHOLD_SECONDS
            ? `Entered flowstate for ${formatDuration(elapsedSeconds)}`
            : `Thinking for ${formatDuration(elapsedSeconds)}`;

    return (
        <span className="inline-flex items-center gap-2">
            <SpiralLoader size={22} />
            <span className="generation-status-shimmer text-sm font-medium">
                {statusText}
            </span>
        </span>
    );
};
