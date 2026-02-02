"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiTrash2 } from "react-icons/fi";

type DeletePortfolioOverlayProps = {
  isOpen: boolean;
  portfolioTitle?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export const DeletePortfolioOverlay: React.FC<DeletePortfolioOverlayProps> = ({
  isOpen,
  portfolioTitle,
  onCancel,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        aria-label="Close delete confirmation"
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
              Delete portfolio?
            </h3>
            <p className="mt-2 text-sm text-white/60">
              You are about to permanently delete{" "}
              <span className="text-white/90 font-medium">
                {portfolioTitle || "this portfolio"}
              </span>
              . This action cannot be undone.
            </p>
          </div>
          <FiTrash2 className="w-5 h-5 text-red-300" />
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
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
