"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

interface ReviewContinueButtonProps {
    disabled: boolean;
    onClick: () => void;
}

export const ReviewContinueButton: React.FC<ReviewContinueButtonProps> = ({
    disabled,
    onClick,
}) => (
    <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
            scale: disabled ? 1 : 1.05,
            backgroundColor: disabled
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(255, 255, 255, 0.15)",
            boxShadow: disabled ? "none" : "0 0 40px rgba(255, 255, 255, 0.25)",
        }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={onClick}
        disabled={disabled}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-muted/80 dark:bg-white/10 backdrop-blur-xl border border-border dark:border-white/20 text-foreground rounded-full font-bold shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-3 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
        {disabled ? (
            <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground dark:border-white" />
                Parsing Resume...
            </>
        ) : (
            <>
                Continue to AI Refinement
                <FiArrowRight className="w-5 h-5" />
            </>
        )}
    </motion.button>
);
