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
    accentClassName = "text-slate-400",
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-white/10 bg-black/85 p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_50px_rgba(255,255,255,0.06)] text-center"
    >
        <div className={`text-lg mb-4 ${accentClassName}`}>{message}</div>
        {detail ? <p className="text-slate-400">{detail}</p> : null}
    </motion.div>
);
