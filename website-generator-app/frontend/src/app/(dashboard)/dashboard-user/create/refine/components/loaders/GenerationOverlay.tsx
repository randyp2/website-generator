"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ComponentDragLoader } from "./ComponentDragLoader";
import { CodeGenerationLoader } from "./CodeGenerationLoader";
import { CodeValidationLoader } from "./CodeValidationLoader";

export type GenerationPhase =
    | "QUEUED"
    | "PROCESSING"
    | "REFINING_PROMPT"
    | "GENERATING"
    | "VALIDATING"
    | "RETRYING"
    | "PERSISTING"
    | "COMPLETED"
    | "FAILED";

const STATUS_LABELS: Record<GenerationPhase, string> = {
    QUEUED: "Queued...",
    PROCESSING: "Processing...",
    REFINING_PROMPT: "Refining your prompt...",
    GENERATING: "Generating code...",
    VALIDATING: "Validating code...",
    RETRYING: "Retrying...",
    PERSISTING: "Saving your portfolio...",
    COMPLETED: "Completed",
    FAILED: "Failed",
};

const getLoader = (phase: GenerationPhase): React.ReactNode => {
    switch (phase) {
        case "GENERATING":
            return <CodeGenerationLoader />;
        case "VALIDATING":
        case "RETRYING":
            return <CodeValidationLoader />;
        case "QUEUED":
        case "PROCESSING":
        case "REFINING_PROMPT":
        case "PERSISTING":
            return <ComponentDragLoader />;
        default:
            return null;
    }
};

interface GenerationOverlayProps {
    phase: GenerationPhase | null;
}

export const GenerationOverlay = ({ phase }: GenerationOverlayProps) => {
    const isVisible = phase !== null && phase !== "COMPLETED" && phase !== "FAILED";

    return (
        <AnimatePresence>
            {isVisible && phase && (
                <motion.div
                    key="generation-overlay"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="refine-mock-overlay absolute inset-0 z-10 flex flex-col items-center justify-center"
                >
                    {getLoader(phase)}
                    <p className="refine-mock-status mt-6 font-mono text-sm animate-pulse">
                        {STATUS_LABELS[phase]}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
