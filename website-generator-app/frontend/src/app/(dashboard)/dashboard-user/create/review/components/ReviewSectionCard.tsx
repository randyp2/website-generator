"use client";

import React from "react";
import { motion } from "framer-motion";

interface ReviewSectionCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const ReviewSectionCard: React.FC<ReviewSectionCardProps> = ({
    children,
    className = "",
    delay = 0,
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 ${className}`}
    >
        {children}
    </motion.div>
);
