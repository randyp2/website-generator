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
                        className="group cursor-pointer rounded-xl border border-border bg-card/80 p-3 transition-all hover:border-primary/30 hover:bg-card"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="mb-1 truncate text-base font-semibold text-foreground">
                                        {portfolio.title}
                                    </h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRename(portfolio); }}
                                        title="Rename"
                                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-muted hover:bg-muted/80 transition-colors"
                                    >
                                        <FiEdit3 className="h-3.5 w-3.5 text-muted-foreground" />
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

                        <div className="flex items-center gap-2 border-t border-border pt-2">
                            <button className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-muted py-1.5 text-xs text-foreground transition-colors hover:bg-muted/80">
                                <FiEye className="w-3.5 h-3.5" />
                                View
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); router.push(resolveResumePath(portfolio)); }}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-muted py-1.5 text-xs text-foreground transition-colors hover:bg-muted/80"
                            >
                                <FiEdit3 className="w-3.5 h-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(portfolio); }}
                                className="group/delete flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-muted transition-colors hover:bg-red-500/10"
                            >
                                <FiTrash2 className="h-3.5 w-3.5 text-foreground group-hover/delete:text-red-500" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
