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
        className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 text-center"
    >
        <div className={`text-lg mb-4 ${accentClassName}`}>{message}</div>
        {detail ? <p className="text-slate-400">{detail}</p> : null}
    </motion.div>
);
