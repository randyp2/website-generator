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
        <div className="h-full overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolios.map((portfolio) => (
                    <motion.div
                        key={portfolio.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-white font-semibold text-base truncate mb-1">
                                        {portfolio.title}
                                    </h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRename(portfolio); }}
                                        title="Rename"
                                        className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <FiEdit3 className="w-3.5 h-3.5 text-white/80" />
                                    </button>
                                </div>
                                <p className="text-white/60 text-xs">
                                    {formatRelativeTime(portfolio.updated_at ?? portfolio.created_at ?? null)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-2">
                            <StatusIndicator status={normalizeStatus(portfolio.status)} />
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <button className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center gap-1.5 transition-colors text-white text-xs cursor-pointer">
                                <FiEye className="w-3.5 h-3.5" />
                                View
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); router.push(resolveResumePath(portfolio)); }}
                                className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center gap-1.5 transition-colors text-white text-xs cursor-pointer"
                            >
                                <FiEdit3 className="w-3.5 h-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(portfolio); }}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-colors group/delete cursor-pointer"
                            >
                                <FiTrash2 className="w-3.5 h-3.5 text-white group-hover/delete:text-red-400" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
