"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

interface VersionTimelineTriggerProps {
    isOpen?: boolean;
    onClick: () => void;
}

export const VersionTimelineTrigger: React.FC<VersionTimelineTriggerProps> = ({
    isOpen = false,
    onClick,
}) => {
    return (
        <motion.button
            onClick={onClick}
            aria-expanded={isOpen}
            className="flex items-center justify-center w-10 h-6 rounded-t-xl
                       bg-[#1a1d21]/80 hover:bg-[#1a1d21] border border-b-0 border-white/10
                       cursor-pointer"
            whileTap={{ scale: 0.95 }}
        >
            <ChevronUp className="w-4 h-4 text-white/40" />
        </motion.button>
    );
};
