"use client";

import * as React from "react";

import { SpiralLoader } from "./SpiralLoader";

interface GenerationStatusProps {
    statusText?: string | null;
}

export const GenerationStatus = ({ statusText }: GenerationStatusProps = {}) => {
    const [loadingState, setLoadingState] = React.useState<
        "analyzing" | "refining" | "creating"
    >("analyzing");

    React.useEffect(() => {
        // If statusText is provided externally, skip timer-based progression
        if (statusText) return;

        // Progress through states: Analyzing (5s) -> Refining (10s) -> Creating (stays)
        let timeoutId: NodeJS.Timeout;

        if (loadingState === "analyzing") {
            timeoutId = setTimeout(() => {
                setLoadingState("refining");
            }, 5000); // 5 seconds for analyzing
        } else if (loadingState === "refining") {
            timeoutId = setTimeout(() => {
                setLoadingState("creating");
            }, 10000); // 10 seconds for refining
        }
        // If state is "creating", stay on it indefinitely

        return () => clearTimeout(timeoutId);
    }, [loadingState, statusText]);

    const getStatusText = () => {
        if (statusText) return statusText;
        switch (loadingState) {
            case "analyzing":
                return "Analyzing prompt...";
            case "refining":
                return "Refining prompt...";
            case "creating":
                return "Creating code...";
        }
    };

    return (
        <span className="inline-flex items-center gap-2">
            <SpiralLoader size={22} />
            <span className="generation-status-shimmer text-sm font-medium">
                {getStatusText()}
            </span>
        </span>
    );
};

GenerationStatus.displayName = "GenerationStatus";
