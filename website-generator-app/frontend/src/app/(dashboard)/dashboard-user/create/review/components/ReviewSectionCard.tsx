"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
        className={cn(
            "rounded-[28px] border border-white/10 bg-black/85 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_50px_rgba(255,255,255,0.06)] backdrop-blur-xl",
            className,
        )}
    >
        {children}
    </motion.div>
);
