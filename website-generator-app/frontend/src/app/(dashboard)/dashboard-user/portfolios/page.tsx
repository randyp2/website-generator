"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiCopy,
  FiDownload,
  FiMoreVertical,
  FiTrash2,
  FiGlobe,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

interface Portfolio {
  id: string;
  title: string;
  thumbnail: string;
  status: "draft";
  lastEdited: string;
  views: number;
  url?: string;
}

const PortfolioManager: React.FC = () => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Mock portfolios - replace with real data
  const portfolios: Portfolio[] = [
    {
      id: "1",
      title: "Software Engineer Portfolio",
      thumbnail: "gradient-1",
      status: "draft",
      lastEdited: "2 hours ago",
      views: 234,
      url: "johndoe.portfolio.ai",
    },
  ];

  const statusConfig = {
    draft: {
      label: "Draft",
      color: "slate",
      bgColor: "bg-slate-100",
      textColor: "text-slate-700",
      dotColor: "bg-slate-500",
    },
  };

  const getThumbnailGradient = (thumbnail: string) => {
    const gradients: Record<string, string> = {
      "gradient-1": "from-sky-400 via-cyan-400 to-teal-400",
      "gradient-2": "from-violet-400 via-purple-400 to-pink-400",
      "gradient-3": "from-orange-400 via-red-400 to-pink-400",
      "gradient-4": "from-emerald-400 via-teal-400 to-cyan-400",
    };
    return gradients[thumbnail] || gradients["gradient-1"];
  };

  return (
    <div className="space-y-8 p-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Your Portfolios
          </h1>
          <p className="text-slate-600">
            {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""}{" "}
            created
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/dashboard/create")}
          className="hidden md:flex items-center gap-2 px-6 py-3 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-sky-400/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all"
        >
          <FiPlus className="w-5 h-5" />
          New Portfolio
        </motion.button>
      </motion.div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio, index) => {
          const status = statusConfig[portfolio.status];

          return (
            <motion.div
              key={portfolio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              onHoverStart={() => setHoveredId(portfolio.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="group relative hover:cursor-pointer"
            >
              {/* Card Container */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/40 shadow-lg hover:shadow-2xl transition-all">
                {/* Thumbnail with linear */}
                <div className="relative h-48 overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${getThumbnailGradient(
                      portfolio.thumbnail
                    )}`}
                  >
                    {/* Overlay pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-size-[24px_24px]" />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 ${status.bgColor} backdrop-blur-sm rounded-full text-xs font-semibold ${status.textColor}`}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-1.5 h-1.5 ${status.dotColor} rounded-full`}
                      />
                      {status.label}
                    </div>
                  </div>

                  {/* Quick Actions Overlay (on hover) */}
                  <AnimatePresence>
                    {hoveredId === portfolio.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center gap-3"
                      >
                        {[
                          { icon: FiEye, label: "Preview" },
                          { icon: FiEdit2, label: "Edit" },
                          { icon: FiCopy, label: "Duplicate" },
                        ].map((action) => (
                          <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={`hover:cursor-pointer p-3 bg-white/90 hover:bg-sky-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow group/btn`}
                            title={action.label}
                          >
                            <action.icon
                              className={`w-5 h-5 text-slate-700 group-hover/btn:text-sky-600 transition-colors`}
                            />
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
                    {portfolio.title}
                  </h3>

                  {/* URL or Last Edited */}
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    {portfolio.url ? (
                      <>
                        <FiGlobe className="w-4 h-4" />
                        <span className="truncate">{portfolio.url}</span>
                      </>
                    ) : (
                      <span>Edited {portfolio.lastEdited}</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <FiEye className="w-4 h-4" />
                      <span>{portfolio.views} views</span>
                    </div>

                    {/* More Actions Menu */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === portfolio.id ? null : portfolio.id
                          )
                        }
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <FiMoreVertical className="w-4 h-4 text-slate-600" />
                      </motion.button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenu === portfolio.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-10"
                          >
                            {[
                              {
                                icon: FiDownload,
                                label: "Export",
                                color: "sky",
                              },
                              {
                                icon: FiCopy,
                                label: "Duplicate",
                                color: "cyan",
                              },
                              { icon: FiTrash2, label: "Delete", color: "red" },
                            ].map((action) => (
                              <button
                                key={action.label}
                                className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-${action.color}-50 transition-colors text-left`}
                              >
                                <action.icon
                                  className={`w-4 h-4 text-${action.color}-600`}
                                />
                                <span className="text-sm font-medium text-slate-700">
                                  {action.label}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/dashboard/create")}
        className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-full shadow-2xl shadow-sky-400/50 flex items-center justify-center z-50"
      >
        <FiPlus className="w-7 h-7" />
      </motion.button>
    </div>
  );
};

export default PortfolioManager;
