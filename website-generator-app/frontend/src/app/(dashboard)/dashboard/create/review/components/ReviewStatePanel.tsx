"use client";

import React from "react";
import { motion } from "framer-motion";

interface ReviewStatePanelProps {
    message: string;
    detail?: string;
    accentClassName?: string;
}

export const ReviewStatePanel: React.FC<ReviewStatePanelProps> = ({
    message,
    detail,
    accentClassName = "text-muted-foreground",
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-border dark:border-white/10 bg-muted/60 dark:bg-black/85 p-10 shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_50px_rgba(255,255,255,0.06)] text-center"
    >
        <div className={`text-lg mb-4 ${accentClassName}`}>{message}</div>
        {detail ? <p className="text-muted-foreground">{detail}</p> : null}
    </motion.div>
);
