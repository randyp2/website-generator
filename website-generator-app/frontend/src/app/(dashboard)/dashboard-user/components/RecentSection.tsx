"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
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

// Portfolio interface
interface Portfolio {
  id: string;
  title: string;
  dateModified: string;
  status: "active" | "draft" | "archived";
}

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
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatRelativeTime = (timestamp?: string | null) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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
        const rows = Array.isArray(data?.portfolios) ? data.portfolios : [];
        const formatted = rows.map((item: any) => ({
          id: item.id,
          title: item.title ?? "Untitled Portfolio",
          dateModified: formatRelativeTime(
            item.updated_at ?? item.created_at ?? null,
          ),
          status:
            item.status === "archived"
              ? "archived"
              : item.status === "active"
                ? "active"
                : "draft",
        }));
        setPortfolios(formatted);
      } catch (error) {
        console.error("Failed to load portfolios:", error);
        setPortfolios([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolios();
  }, [user?.id]);

  // Sort and filter portfolios based on current options
  const filteredAndSortedPortfolios = [...portfolios]
    .filter(portfolio => {
      // Filter out archived if showArchived is false
      if (!showArchived && portfolio.status === 'archived') {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'date') {
        // Mock date sorting - in reality you'd compare actual dates
        const dateOrder: { [key: string]: number } = {
          '2 hours ago': 1,
          'Yesterday': 2,
          '3 days ago': 3
        };
        return dateOrder[a.dateModified] - dateOrder[b.dateModified];
      } else {
        // Sort by status
        const statusOrder: { [key: string]: number } = {
          'active': 1,
          'draft': 2,
          'archived': 3
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }
    });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Sort Button */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-blue-500 border border-blue-400/20 rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg"
          >
            <FiGrid className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Display</span>
            <FiChevronDown className="w-4 h-4 text-white" />
          </button>

          {/* Display Dropdown Menu */}
          {showSortMenu && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-[#1a1d21] border border-white/10 rounded-lg shadow-2xl z-50 p-4">

              {/* Top Section: Display Mode Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Card Display */}
                <button
                  onClick={() => {
                    setDisplayMode('card');
                    setShowSortMenu(false);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    displayMode === 'card'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <FiGrid className="w-6 h-6 text-white" />
                  <span className="text-sm font-medium text-white">Card Display</span>
                </button>

                {/* List Display */}
                <button
                  onClick={() => {
                    setDisplayMode('list');
                    setShowSortMenu(false);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    displayMode === 'list'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <FiList className="w-6 h-6 text-white" />
                  <span className="text-sm font-medium text-white">List Display</span>
                </button>
              </div>

              {/* Bottom Section: Ordering Card */}
              <div className="mb-3 bg-white/5 border border-white/10 rounded-lg p-3">
                <label className="text-xs font-semibold text-white/60 uppercase mb-2 block">
                  Ordering
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'status')}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                >
                  <option value="date">Date Modified</option>
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
                    onClick={() => setShowArchived(!showArchived)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      showArchived ? 'bg-blue-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        showArchived ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  {showArchived ? 'Showing' : 'Hiding'} archived portfolios
                </p>
              </div>

            </div>
          )}
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
              <div className="flex-1 text-white font-medium truncate">
                {portfolio.title}
              </div>

              {/* Date Modified */}
              <div className="flex-1 text-center text-white/70 text-sm">
                {portfolio.dateModified}
              </div>

              {/* Status */}
              <div className="flex-1 flex justify-center">
                <StatusIndicator status={portfolio.status} />
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
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <FiEdit3 className="w-4 h-4 text-white" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-colors group">
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
                      <h3 className="text-white font-semibold text-base truncate mb-1">
                        {portfolio.title}
                      </h3>
                      <p className="text-white/60 text-xs">
                        {portfolio.dateModified}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-2">
                    <StatusIndicator status={portfolio.status} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center gap-1.5 transition-colors text-white text-xs">
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
                      className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center gap-1.5 transition-colors text-white text-xs"
                    >
                      <FiEdit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-colors group/delete">
                      <FiTrash2 className="w-3.5 h-3.5 text-white group-hover/delete:text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
