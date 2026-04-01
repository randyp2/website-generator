"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiEdit3, FiEye, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Portfolio } from "@/types/portfolio";
import { StatusIndicator } from "./StatusIndicator";
import { normalizeStatus, formatRelativeTime, resolveResumePath } from "../utils/portfolioUtils";

type PortfolioCardViewProps = {
    portfolios: Portfolio[];
    onRename: (portfolio: Portfolio) => void;
    onDelete: (portfolio: Portfolio) => void;
};

export const PortfolioCardView: React.FC<PortfolioCardViewProps> = ({
    portfolios,
    onRename,
    onDelete,
}) => {
    const router = useRouter();

    return (
        <div className="h-full overflow-y-auto p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolios.map((portfolio) => (
                    <motion.div
                        key={portfolio.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="group cursor-pointer rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/20 hover:bg-muted/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="mb-1 truncate text-base font-semibold text-foreground dark:text-white">
                                        {portfolio.title}
                                    </h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRename(portfolio); }}
                                        title="Rename"
                                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-muted transition-colors hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20"
                                    >
                                        <FiEdit3 className="h-3.5 w-3.5 text-muted-foreground dark:text-white/80" />
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formatRelativeTime(portfolio.updated_at ?? portfolio.created_at ?? null)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-2">
                            <StatusIndicator status={normalizeStatus(portfolio.status)} />
                        </div>

                        <div className="flex items-center gap-2 border-t border-border pt-2 dark:border-white/10">
                            <button className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-muted py-1.5 text-xs text-foreground transition-colors hover:bg-muted/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                                <FiEye className="w-3.5 h-3.5" />
                                View
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); router.push(resolveResumePath(portfolio)); }}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-muted py-1.5 text-xs text-foreground transition-colors hover:bg-muted/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                            >
                                <FiEdit3 className="w-3.5 h-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(portfolio); }}
                                className="group/delete flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-muted transition-colors hover:bg-red-500/10 dark:bg-white/10 dark:hover:bg-red-500/20"
                            >
                                <FiTrash2 className="h-3.5 w-3.5 text-foreground group-hover/delete:text-red-500 dark:text-white dark:group-hover/delete:text-red-400" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
