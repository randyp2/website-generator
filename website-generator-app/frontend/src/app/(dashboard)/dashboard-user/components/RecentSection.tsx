"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
  FiEdit3,
  FiEye,
  FiTrash2,
  FiChevronDown,
  FiSearch,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Portfolio as PortfolioRecord } from "@/types/portfolio";

// Status Indicator Component
const StatusIndicator: React.FC<{
    status: "active" | "draft" | "archived";
}> = ({ status }) => {
    const config = {
        active: {
            color: "bg-green-500",
            label: "Active",
            glow: "shadow-[0_0_12px_rgba(34,197,94,0.5)]",
        },
        draft: {
            color: "bg-yellow-500",
            label: "Draft",
            glow: "shadow-[0_0_12px_rgba(234,179,8,0.5)]",
        },
        archived: {
            color: "bg-red-500",
            label: "Archived",
            glow: "shadow-[0_0_12px_rgba(239,68,68,0.5)]",
        },
    };

    const { color, label, glow } = config[status];

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color} ${glow}`} />
            <span className="text-white/80 text-sm">{label}</span>
        </div>
    );
};

export const RecentSection: React.FC = () => {
    const router = useRouter();
    const { user } = useUser();
    const [sortBy, setSortBy] = useState<"name" | "date" | "status">("date");
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [displayMode, setDisplayMode] = useState<"card" | "list">("list");
    const [showArchived, setShowArchived] = useState(true);
  const [portfolios, setPortfolios] = useState<PortfolioRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
  const [renameTarget, setRenameTarget] = useState<PortfolioRecord | null>(null);
    const [renameTitle, setRenameTitle] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const sortMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!showSortMenu) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                sortMenuRef.current &&
                !sortMenuRef.current.contains(event.target as Node)
            ) {
                setShowSortMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSortMenu]);

    const formatRelativeTime = (timestamp?: unknown | null) => {
        if (!timestamp) return "Just now";
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp as any);
        const diffMs = Date.now() - date.getTime();
        const minutes = Math.floor(diffMs / 60000);
        if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const normalizeStatus = (status?: string | null) => {
        if (status === "archived") return "archived";
        if (status === "active") return "active";
        return "draft";
    };

    const getDateValue = (timestamp?: unknown | null) => {
        if (!timestamp) return 0;
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp as any);
        const value = date.getTime();
        return Number.isNaN(value) ? 0 : value;
    };

    useEffect(() => {
        const loadPortfolios = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/portfolio/list?userId=${user.id}`,
                );
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                const rows: PortfolioRecord[] = Array.isArray(data?.portfolios)
                    ? data.portfolios.map((item: PortfolioRecord) => ({
                          ...item,
                          title: item.title ?? "Untitled Portfolio",
                      }))
                    : [];
                setPortfolios(rows);
            } catch (error) {
                console.error("Failed to load portfolios:", error);
                setPortfolios([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadPortfolios();
    }, [user?.id]);

    const handleDelete = async (portfolioId: string) => {
        try {
            setIsDeleting(true);
            const res = await fetch(`/api/portfolio/${portfolioId}/delete`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error(`HTTP error: ${res.status}`);
            }

            setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
            setDeleteTarget(null);
        } catch (error) {
            console.error("Deletion failed:", error);
            alert("Failed to delete portfolio.");
        } finally {
            setIsDeleting(false);
        }
    };

    const openRename = (portfolio: PortfolioRecord) => {
        setRenameTarget(portfolio);
        setRenameTitle(portfolio.title);
    };

    const handleRename = async () => {
        if (!renameTarget) return;
        const trimmed = renameTitle.trim();
        if (!trimmed) return;

        try {
            setIsRenaming(true);
            const res = await fetch(
                `/api/portfolio/${renameTarget.id}/update`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: trimmed }),
                },
            );

            if (!res.ok) {
                throw new Error(`HTTP error: ${res.status}`);
            }

            setPortfolios((prev) =>
                prev.map((p) =>
                    p.id === renameTarget.id ? { ...p, title: trimmed } : p,
                ),
            );
            setRenameTarget(null);
        } catch (error) {
            console.error("Rename failed:", error);
            alert("Failed to rename portfolio.");
        } finally {
            setIsRenaming(false);
        }
    };

    // Sort and filter portfolios based on current options
    const filteredAndSortedPortfolios = [...portfolios]
        .filter((portfolio) => {
            if (!showArchived && normalizeStatus(portfolio.status) === "archived") {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "name") {
                return a.title.localeCompare(b.title);
            } else if (sortBy === "date") {
                const aDate = getDateValue(a.updated_at ?? a.created_at ?? null);
                const bDate = getDateValue(b.updated_at ?? b.created_at ?? null);
                return bDate - aDate;
            } else {
                const statusOrder: Record<string, number> = {
                    active: 1,
                    draft: 2,
                    archived: 3,
                };
                return (
                    statusOrder[normalizeStatus(a.status)] -
                    statusOrder[normalizeStatus(b.status)]
                );
            }
        });

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                {/* Sort Button */}
                <div className="relative" ref={sortMenuRef}>
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-blue-500 border border-blue-400/20 rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg cursor-pointer"
                    >
                        <FiGrid className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">
                            Display
                        </span>
                        <FiChevronDown className="w-4 h-4 text-white" />
                    </button>

                    {/* Display Dropdown Menu */}
                    <AnimatePresence>
                        {showSortMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 360,
                                    damping: 28,
                                }}
                                className="absolute top-full left-0 mt-2 w-80 bg-[#1a1d21] border border-white/10 rounded-lg shadow-2xl z-50 p-4"
                            >
                                {/* Top Section: Display Mode Cards */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {/* Card Display */}
                                    <button
                                        onClick={() => {
                                            setDisplayMode("card");
                                            setShowSortMenu(false);
                                        }}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                            displayMode === "card"
                                                ? "border-blue-500 bg-blue-500/10"
                                                : "border-white/10 bg-white/5 hover:border-white/20"
                                        }`}
                                    >
                                        <FiGrid className="w-6 h-6 text-white" />
                                        <span className="text-sm font-medium text-white">
                                            Card Display
                                        </span>
                                    </button>

                                    {/* List Display */}
                                    <button
                                        onClick={() => {
                                            setDisplayMode("list");
                                            setShowSortMenu(false);
                                        }}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                            displayMode === "list"
                                                ? "border-blue-500 bg-blue-500/10"
                                                : "border-white/10 bg-white/5 hover:border-white/20"
                                        }`}
                                    >
                                        <FiList className="w-6 h-6 text-white" />
                                        <span className="text-sm font-medium text-white">
                                            List Display
                                        </span>
                                    </button>
                                </div>

                                {/* Bottom Section: Ordering Card */}
                                <div className="mb-3 bg-white/5 border border-white/10 rounded-lg p-3">
                                    <label className="text-xs font-semibold text-white/60 uppercase mb-2 block">
                                        Ordering
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(
                                                e.target.value as
                                                    | "name"
                                                    | "date"
                                                    | "status",
                                            )
                                        }
                                        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                                    >
                                        <option value="date">
                                            Date Modified
                                        </option>
                                        <option value="name">Name</option>
                                        <option value="status">Status</option>
                                    </select>
                                </div>

                                {/* Bottom Section: Archive Links Card */}
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-white/60 uppercase">
                                            Archive Links
                                        </label>
                                        <button
                                            onClick={() =>
                                                setShowArchived(!showArchived)
                                            }
                                            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                                                showArchived
                                                    ? "bg-blue-500"
                                                    : "bg-white/20"
                                            }`}
                                        >
                                            <div
                                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                                                    showArchived
                                                        ? "translate-x-6"
                                                        : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-xs text-white/50 mt-1">
                                        {showArchived ? "Showing" : "Hiding"}{" "}
                                        archived portfolios
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search Box (Non-functional) */}
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                        type="text"
                        placeholder="Search portfolios..."
                        disabled
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Portfolio Container - Conditional Rendering */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="bg-white/5 rounded-2xl border border-white/10 h-[500px]"
            >
                {isLoading ? (
                    <div className="h-full flex items-center justify-center text-white/60">
                        Loading portfolios...
                    </div>
                ) : filteredAndSortedPortfolios.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-white/60">
                        No portfolios yet.
                    </div>
                ) : displayMode === "list" ? (
                    /* List View */
                    <div className="h-full overflow-y-auto divide-y divide-white/10 [&>*:last-child]:border-b [&>*:last-child]:border-white/10">
                        {filteredAndSortedPortfolios.map((portfolio) => (
                            <motion.div
                                key={portfolio.id}
                                className="flex items-center justify-between px-8 py-5 hover:bg-white/5 transition-all cursor-pointer"
                            >
                                {/* Portfolio Title */}
                                <div className="flex-1 text-white font-medium truncate flex items-center gap-2">
                                    <span className="truncate">
                                        {portfolio.title}
                                    </span>
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            openRename(portfolio);
                                        }}
                                        title="Rename"
                                        className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <FiEdit3 className="w-3.5 h-3.5 text-white/80" />
                                    </button>
                                </div>

                                {/* Date Modified */}
                                <div className="flex-1 text-center text-white/70 text-sm">
                                    {formatRelativeTime(
                                        portfolio.updated_at ??
                                            portfolio.created_at ??
                                            null,
                                    )}
                                </div>

                                {/* Status */}
                                <div className="flex-1 flex justify-center">
                                    <StatusIndicator
                                        status={normalizeStatus(
                                            portfolio.status,
                                        )}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2">
                                    <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                        <FiEye className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            router.push(
                                                `/dashboard-user/create/refine?portfolioId=${portfolio.id}`,
                                            );
                                        }}
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <FiEdit3 className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setDeleteTarget(portfolio);
                                        }}
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-colors group cursor-pointer"
                                    >
                                        <FiTrash2 className="w-4 h-4 text-white group-hover:text-red-400" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    /* Card View */
                    <div className="h-full overflow-y-auto p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAndSortedPortfolios.map((portfolio) => (
                                <motion.div
                                    key={portfolio.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-semibold text-base truncate mb-1">
                                                    {portfolio.title}
                                                </h3>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        openRename(portfolio);
                                                    }}
                                                    title="Rename"
                                                    className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                                                >
                                                    <FiEdit3 className="w-3.5 h-3.5 text-white/80" />
                                                </button>
                                            </div>
                                            <p className="text-white/60 text-xs">
                                                {formatRelativeTime(
                                                    portfolio.updated_at ??
                                                        portfolio.created_at ??
                                                        null,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mb-2">
                                        <StatusIndicator
                                            status={normalizeStatus(
                                                portfolio.status,
                                            )}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                        <button className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center gap-1.5 transition-colors text-white text-xs cursor-pointer">
                                            <FiEye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                router.push(
                                                    `/dashboard-user/create/refine?portfolioId=${portfolio.id}`,
                                                );
                                            }}
                                            className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center gap-1.5 transition-colors text-white text-xs cursor-pointer"
                                        >
                                            <FiEdit3 className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setDeleteTarget(portfolio);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-colors group/delete cursor-pointer"
                                        >
                                            <FiTrash2 className="w-3.5 h-3.5 text-white group-hover/delete:text-red-400" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <button
                        aria-label="Close delete confirmation"
                        onClick={() => setDeleteTarget(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#121419] shadow-2xl p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold text-white">
                                    Delete portfolio?
                                </h3>
                                <p className="mt-2 text-sm text-white/60">
                                    You are about to permanently delete{" "}
                                    <span className="text-white/90 font-medium">
                                        {deleteTarget.title}
                                    </span>
                                    . This action cannot be undone.
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                                <FiTrash2 className="w-5 h-5 text-red-300" />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteTarget.id)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {renameTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <button
                        aria-label="Close rename"
                        onClick={() => setRenameTarget(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#121419] shadow-2xl p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold text-white">
                                    Rename portfolio
                                </h3>
                                <p className="mt-2 text-sm text-white/60">
                                    Update the title to keep things organized.
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                                <FiEdit3 className="w-5 h-5 text-blue-200" />
                            </div>
                        </div>
                        <div className="mt-5">
                            <label className="text-xs font-semibold text-white/60 uppercase">
                                Portfolio name
                            </label>
                            <input
                                value={renameTitle}
                                onChange={(event) =>
                                    setRenameTitle(event.target.value)
                                }
                                placeholder="e.g. Product Designer Portfolio"
                                className="mt-2 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                            />
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setRenameTarget(null)}
                                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRename}
                                disabled={isRenaming || !renameTitle.trim()}
                                className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isRenaming ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
