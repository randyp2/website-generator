"use client";

import React, { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiSearch, FiGrid, FiList } from "react-icons/fi";
import { Button } from "@/components/ui/button";

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
                <Button
                    type="button"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="gap-2 shadow-lg shadow-primary/30 hover:cursor-pointer"
                >
                    <FiGrid className="h-4 w-4" />
                    <span>Display</span>
                    <FiChevronDown className="h-4 w-4" />
                </Button>

                <AnimatePresence>
                    {showSortMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 360, damping: 28 }}
                            className="absolute top-full left-0 z-50 mt-2 w-80 rounded-lg border border-border bg-card p-4 shadow-2xl"
                        >
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    onClick={() => { setDisplayMode("card"); setShowSortMenu(false); }}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                        displayMode === "card"
                                            ? "border-primary bg-primary/15"
                                            : "border-border bg-background hover:border-primary/40"
                                    }`}
                                >
                                    <FiGrid className="h-6 w-6 text-foreground" />
                                    <span className="text-sm font-medium text-foreground">Card Display</span>
                                </button>
                                <button
                                    onClick={() => { setDisplayMode("list"); setShowSortMenu(false); }}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                        displayMode === "list"
                                            ? "border-primary bg-primary/15"
                                            : "border-border bg-background hover:border-primary/40"
                                    }`}
                                >
                                    <FiList className="h-6 w-6 text-foreground" />
                                    <span className="text-sm font-medium text-foreground">List Display</span>
                                </button>
                            </div>

                            <div className="mb-3 rounded-lg border border-border bg-background p-3">
                                <label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">
                                    Ordering
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:cursor-pointer focus:border-primary focus:outline-none"
                                >
                                    <option value="date">Date Modified</option>
                                    <option value="name">Name</option>
                                    <option value="status">Status</option>
                                </select>
                            </div>

                            <div className="rounded-lg border border-border bg-background p-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                                        Archive Links
                                    </label>
                                    <button
                                        onClick={() => setShowArchived(!showArchived)}
                                        className={`relative h-6 w-12 cursor-pointer rounded-full transition-colors ${showArchived ? "bg-primary" : "bg-muted"}`}
                                    >
                                        <div
                                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full border border-border bg-background transition-transform ${
                                                showArchived ? "translate-x-6" : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {showArchived ? "Showing" : "Hiding"} archived portfolios
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="relative min-w-0 flex-1">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by title, URL, status, template..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
            </div>
        </div>
    );
};
