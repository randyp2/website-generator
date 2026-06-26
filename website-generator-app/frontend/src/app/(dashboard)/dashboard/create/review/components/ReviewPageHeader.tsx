"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiEdit3, FiSave } from "react-icons/fi";
import { Button } from "@/components/ui/button";

const MotionButton = motion.create(Button);

interface ReviewPageHeaderProps {
    isEditing: boolean;
    onToggleEditing: () => void;
}

export const ReviewPageHeader: React.FC<ReviewPageHeaderProps> = ({
    isEditing,
    onToggleEditing,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-8 max-w-5xl"
        >
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                        Review Your Information
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                        Review and edit the information extracted from your resume
                    </p>
                </div>

                <MotionButton
                    variant="outline"
                    onClick={onToggleEditing}
                    className={
                        isEditing
                            ? "h-10 cursor-pointer rounded-md border border-emerald-900/70 bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-800 px-4 text-sm font-semibold text-emerald-50 shadow-[0_10px_30px_rgba(6,78,59,0.38)] transition hover:from-emerald-900 hover:via-emerald-800 hover:to-emerald-700 hover:text-white"
                            : "h-10 cursor-pointer rounded-md border border-white/10 bg-black/30 px-4 text-sm font-medium text-slate-200 shadow-none hover:bg-black/30 hover:text-slate-200"
                    }
                >
                    {isEditing ? (
                        <>
                            <FiSave className="h-4 w-4" />
                            Save
                        </>
                    ) : (
                        <>
                            <FiEdit3 className="h-4 w-4" />
                            Edit
                        </>
                    )}
                </MotionButton>
            </div>
        </motion.div>
    );
};
