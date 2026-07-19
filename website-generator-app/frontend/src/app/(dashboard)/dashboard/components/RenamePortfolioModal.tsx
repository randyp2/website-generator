"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiEdit3 } from "react-icons/fi";
import { Button } from "@/components/ui/button";

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
                className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-card-foreground">
                            Rename portfolio
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Update the title to keep things organized.
                        </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
                        <FiEdit3 className="h-5 w-5 text-primary" />
                    </div>
                </div>
                <div className="mt-5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                        Portfolio name
                    </label>
                    <input
                        value={renameTitle}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="e.g. Product Designer Portfolio"
                        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isRenaming || !renameTitle.trim()}
                    >
                        {isRenaming ? "Saving..." : "Save"}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
