"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";

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
    <DeletePortfolioDialogContent
      key={portfolioTitle ?? "delete-portfolio"}
      portfolioTitle={portfolioTitle}
      onCancel={onCancel}
      onConfirm={onConfirm}
      isDeleting={isDeleting}
    />
  );
};

const DeletePortfolioDialogContent: React.FC<
  Omit<DeletePortfolioOverlayProps, "isOpen">
> = ({ portfolioTitle, onCancel, onConfirm, isDeleting = false }) => {
  const [confirmText, setConfirmText] = useState("");

  const expectedName = portfolioTitle?.trim() || "";
  const isConfirmed = expectedName.length > 0 && confirmText.trim() === expectedName;

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
          <FiTrash2 className="h-6 w-6 shrink-0 text-destructive" />
        </div>

        {/* Caution callout */}
        <div className="-mx-6 mt-5 flex items-start gap-3 border-y border-red-500/40 bg-red-900/20 px-6 py-3">
          <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-200">
            This permanently erases the portfolio along with all of its analytics
            and metrics. None of this data can be recovered once deleted.
          </p>
        </div>

        {/* Type-to-confirm */}
        <div className="mt-5">
          <label
            htmlFor="delete-confirm-input"
            className="block text-sm text-muted-foreground"
          >
            To confirm, type{" "}
            <span className="font-semibold text-red-500">
              {expectedName || "the portfolio name"}
            </span>{" "}
            below.
          </label>
          <input
            id="delete-confirm-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            placeholder={expectedName || "Portfolio name"}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-destructive"
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting || !isConfirmed}
            className="flex-1 cursor-pointer rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
