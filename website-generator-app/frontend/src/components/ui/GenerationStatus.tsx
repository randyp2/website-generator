"use client";

import * as React from "react";
import { motion } from "framer-motion";

export const GenerationStatus = () => {
    const [loadingState, setLoadingState] = React.useState<
        "analyzing" | "refining" | "creating"
    >("analyzing");

    React.useEffect(() => {
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
    }, [loadingState]);

    const getStatusText = () => {
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
        <motion.span
            className="bg-[linear-gradient(110deg,#ffffff,35%,#000000,50%,#ffffff,75%,#ffffff)] bg-[length:200%_100%] bg-clip-text text-transparent text-sm font-medium"
            initial={{ backgroundPosition: "200% 0" }}
            animate={{
                backgroundPosition: "-200% 0",
            }}
            transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear",
            }}
        >
            {getStatusText()}
        </motion.span>
    );
};

GenerationStatus.displayName = "GenerationStatus";
