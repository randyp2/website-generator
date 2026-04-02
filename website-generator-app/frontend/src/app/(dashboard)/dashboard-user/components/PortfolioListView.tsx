"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiEdit3, FiEye, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Portfolio } from "@/types/portfolio";
import { StatusIndicator } from "./StatusIndicator";
import { normalizeStatus, formatRelativeTime, resolveResumePath } from "../utils/portfolioUtils";

type PortfolioListViewProps = {
    portfolios: Portfolio[];
    onRename: (portfolio: Portfolio) => void;
    onDelete: (portfolio: Portfolio) => void;
};

export const PortfolioListView: React.FC<PortfolioListViewProps> = ({
    portfolios,
    onRename,
    onDelete,
}) => {
    const router = useRouter();

    return (
        <div className="h-full divide-y divide-border overflow-y-auto [scrollbar-color:var(--primary)_var(--muted)] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb:hover]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/65 [&::-webkit-scrollbar-track]:bg-muted/60 [&::-webkit-scrollbar]:w-2 [&>*:last-child]:border-b [&>*:last-child]:border-border">
            {portfolios.map((portfolio) => (
                <motion.div
                    key={portfolio.id}
                    className="flex cursor-pointer items-center justify-between px-5 py-5 transition-all hover:bg-muted/50 md:px-6"
                >
                    <div className="flex flex-1 items-center gap-2 truncate font-medium text-foreground">
                        <span className="truncate">{portfolio.title}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRename(portfolio); }}
                            title="Rename"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-muted hover:bg-muted/80 transition-colors"
                        >
                            <FiEdit3 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="flex-1 text-center text-sm text-muted-foreground">
                        {formatRelativeTime(portfolio.updated_at ?? portfolio.created_at ?? null)}
                    </div>

                    <div className="flex-1 flex justify-center">
                        <StatusIndicator status={normalizeStatus(portfolio.status)} />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                            <FiEye className="h-4 w-4 text-foreground" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); router.push(resolveResumePath(portfolio)); }}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                            <FiEdit3 className="h-4 w-4 text-foreground" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(portfolio); }}
                            className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-muted transition-colors hover:bg-red-500/10"
                        >
                            <FiTrash2 className="h-4 w-4 text-foreground group-hover:text-red-500" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
