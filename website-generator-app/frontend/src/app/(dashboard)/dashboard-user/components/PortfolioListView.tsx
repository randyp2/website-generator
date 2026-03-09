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
        <div className="h-full overflow-y-auto divide-y divide-white/10 [&>*:last-child]:border-b [&>*:last-child]:border-white/10">
            {portfolios.map((portfolio) => (
                <motion.div
                    key={portfolio.id}
                    className="flex items-center justify-between px-8 py-5 hover:bg-white/5 transition-all cursor-pointer"
                >
                    <div className="flex-1 text-white font-medium truncate flex items-center gap-2">
                        <span className="truncate">{portfolio.title}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRename(portfolio); }}
                            title="Rename"
                            className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <FiEdit3 className="w-3.5 h-3.5 text-white/80" />
                        </button>
                    </div>

                    <div className="flex-1 text-center text-white/70 text-sm">
                        {formatRelativeTime(portfolio.updated_at ?? portfolio.created_at ?? null)}
                    </div>

                    <div className="flex-1 flex justify-center">
                        <StatusIndicator status={normalizeStatus(portfolio.status)} />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                            <FiEye className="w-4 h-4 text-white" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); router.push(resolveResumePath(portfolio)); }}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <FiEdit3 className="w-4 h-4 text-white" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(portfolio); }}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-colors group cursor-pointer"
                        >
                            <FiTrash2 className="w-4 h-4 text-white group-hover:text-red-400" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
