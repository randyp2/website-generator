"use client";

import React, { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiSearch, FiGrid, FiList } from "react-icons/fi";

type SortBy = "name" | "date" | "status";
type DisplayMode = "card" | "list";

type PortfolioToolbarProps = {
    sortBy: SortBy;
    setSortBy: (sortBy: SortBy) => void;
    displayMode: DisplayMode;
    setDisplayMode: (mode: DisplayMode) => void;
    showArchived: boolean;
    setShowArchived: (show: boolean) => void;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
};

export const PortfolioToolbar: React.FC<PortfolioToolbarProps> = ({
    sortBy,
    setSortBy,
    displayMode,
    setDisplayMode,
    showArchived,
    setShowArchived,
    searchQuery,
    setSearchQuery,
}) => {
    const [showSortMenu, setShowSortMenu] = useState(false);
    const sortMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!showSortMenu) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setShowSortMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSortMenu]);

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="relative" ref={sortMenuRef}>
                <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary/40 bg-primary px-4 py-2 text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
                >
                    <FiGrid className="h-4 w-4 text-primary-foreground" />
                    <span className="text-sm font-medium text-primary-foreground">Display</span>
                    <FiChevronDown className="h-4 w-4 text-primary-foreground" />
                </button>

                <AnimatePresence>
                    {showSortMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 360, damping: 28 }}
                            className="absolute top-full left-0 mt-2 w-80 bg-[#1a1d21] border border-white/10 rounded-lg shadow-2xl z-50 p-4"
                        >
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    onClick={() => { setDisplayMode("card"); setShowSortMenu(false); }}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                        displayMode === "card"
                                            ? "border-primary bg-primary/15"
                                            : "border-white/10 bg-white/5 hover:border-white/20"
                                    }`}
                                >
                                    <FiGrid className="w-6 h-6 text-white" />
                                    <span className="text-sm font-medium text-white">Card Display</span>
                                </button>
                                <button
                                    onClick={() => { setDisplayMode("list"); setShowSortMenu(false); }}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                        displayMode === "list"
                                            ? "border-primary bg-primary/15"
                                            : "border-white/10 bg-white/5 hover:border-white/20"
                                    }`}
                                >
                                    <FiList className="w-6 h-6 text-white" />
                                    <span className="text-sm font-medium text-white">List Display</span>
                                </button>
                            </div>

                            <div className="mb-3 bg-white/5 border border-white/10 rounded-lg p-3">
                                <label className="text-xs font-semibold text-white/60 uppercase mb-2 block">
                                    Ordering
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                                >
                                    <option value="date">Date Modified</option>
                                    <option value="name">Name</option>
                                    <option value="status">Status</option>
                                </select>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-white/60 uppercase">
                                        Archive Links
                                    </label>
                                    <button
                                        onClick={() => setShowArchived(!showArchived)}
                                        className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${showArchived ? "bg-primary" : "bg-white/20"}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${showArchived ? "translate-x-6" : "translate-x-0"}`} />
                                    </button>
                                </div>
                                <p className="text-xs text-white/50 mt-1">
                                    {showArchived ? "Showing" : "Hiding"} archived portfolios
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="relative min-w-0 flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                    type="text"
                    placeholder="Search by title, URL, status, template..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
                />
            </div>
        </div>
    );
};
