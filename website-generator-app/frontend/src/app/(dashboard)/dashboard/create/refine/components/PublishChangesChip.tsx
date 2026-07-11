"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Globe, Check } from "lucide-react";

interface PublishChangesChipProps {
    visible: boolean;
    isPublishing: boolean;
    onPublish: () => Promise<boolean>;
}

/**
 * Compact pill shown while a published portfolio has editor changes that
 * visitors can't see yet. One click pins the current version live; a brief
 * confirmation state replaces the pill before it animates out.
 */
export const PublishChangesChip: React.FC<PublishChangesChipProps> = ({
    visible,
    isPublishing,
    onPublish,
}) => {
    const [justPublished, setJustPublished] = useState(false);

    const handlePublish = async (): Promise<void> => {
        const succeeded = await onPublish();
        if (succeeded) {
            setJustPublished(true);
            setTimeout(() => setJustPublished(false), 2200);
        }
    };

    const showChip = visible || justPublished;

    return (
        <AnimatePresence>
            {showChip && (
                <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="pointer-events-auto flex items-center gap-3 rounded-full border border-orange-400/30 bg-orange-50/90 py-1.5 pl-4 pr-1.5 shadow-[0_10px_32px_rgba(249,115,22,0.14)] backdrop-blur-xl dark:border-orange-900/45 dark:bg-orange-950/50 dark:shadow-[0_10px_32px_rgba(124,45,18,0.28)]"
                >
                    {justPublished ? (
                        <span className="flex items-center gap-2 py-1 pr-2.5 text-xs font-medium text-orange-800 dark:text-orange-200">
                            <Check className="h-3.5 w-3.5" />
                            Live site updated
                        </span>
                    ) : (
                        <>
                            <span className="flex items-center gap-2 text-xs font-medium text-orange-800 dark:text-orange-200">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                                </span>
                                Unpublished changes
                            </span>
                            <button
                                type="button"
                                onClick={() => void handlePublish()}
                                disabled={isPublishing}
                                className="flex h-7 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isPublishing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Globe className="h-3.5 w-3.5" />
                                )}
                                Publish changes
                            </button>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PublishChangesChip;
