"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiEdit3, FiSave } from "react-icons/fi";

interface ReviewPageHeaderProps {
    isEditing: boolean;
    onToggleEditing: () => void;
}

export const ReviewPageHeader: React.FC<ReviewPageHeaderProps> = ({
    isEditing,
    onToggleEditing,
}) => (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto mb-8"
    >
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                    Review Your Information
                </h1>
                <p className="text-slate-300 text-lg">
                    Review and edit the information extracted from your resume
                </p>
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleEditing}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all ${
                    isEditing
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                        : "bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white hover:bg-white/20"
                }`}
            >
                {isEditing ? (
                    <>
                        <FiSave className="w-5 h-5" />
                        Save & Done
                    </>
                ) : (
                    <>
                        <FiEdit3 className="w-5 h-5" />
                        Edit
                    </>
                )}
            </motion.button>
        </div>
    </motion.div>
);
