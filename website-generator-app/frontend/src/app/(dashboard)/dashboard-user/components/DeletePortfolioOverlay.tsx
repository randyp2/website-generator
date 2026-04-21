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
        className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-card-foreground">
              Delete portfolio?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">
                {portfolioTitle || "this portfolio"}
              </span>
              . This action cannot be undone.
            </p>
          </div>
          <FiTrash2 className="h-5 w-5 text-destructive" />
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="cursor-pointer rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
