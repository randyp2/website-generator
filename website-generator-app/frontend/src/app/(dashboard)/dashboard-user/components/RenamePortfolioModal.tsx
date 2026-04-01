"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiEdit3 } from "react-icons/fi";

type RenamePortfolioModalProps = {
    renameTitle: string;
    isRenaming: boolean;
    onTitleChange: (title: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
};

export const RenamePortfolioModal: React.FC<RenamePortfolioModalProps> = ({
    renameTitle,
    isRenaming,
    onTitleChange,
    onConfirm,
    onCancel,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button
                aria-label="Close rename"
                onClick={onCancel}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#121419] shadow-2xl p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-white">
                            Rename portfolio
                        </h3>
                        <p className="mt-2 text-sm text-white/60">
                            Update the title to keep things organized.
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                        <FiEdit3 className="w-5 h-5 text-blue-200" />
                    </div>
                </div>
                <div className="mt-5">
                    <label className="text-xs font-semibold text-white/60 uppercase">
                        Portfolio name
                    </label>
                    <input
                        value={renameTitle}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="e.g. Product Designer Portfolio"
                        className="mt-2 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                    />
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isRenaming || !renameTitle.trim()}
                        className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isRenaming ? "Saving..." : "Save"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
