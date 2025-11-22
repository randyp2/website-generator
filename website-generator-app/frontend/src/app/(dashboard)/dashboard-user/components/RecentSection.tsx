"use client";

import { motion } from "framer-motion";
import React from "react";
import { FiEdit3, FiEye, FiFolder } from "react-icons/fi";

export const RecentSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-sky-100 to-cyan-200 flex items-center justify-center">
            <FiFolder className="w-5 h-5 text-cyan-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Recent Portfolios
          </h2>
        </div>
        <button className="text-sky-600 hover:text-sky-700 font-medium text-sm hover:underline transition-all">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Portfolio Placeholder Card 1 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-sky-300 hover:shadow-xl transition-shadow cursor-pointer bg-white"
        >
          {/* Portfolio Preview Area */}
          <div className="h-48 bg-linear-to-br from-sky-50 via-cyan-50 to-teal-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <FiEye className="w-4 h-4 text-sky-600" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <FiEdit3 className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>
          {/* Portfolio Info */}
          <div className="p-4">
            <div className="h-5 bg-slate-200 rounded-md mb-2 w-3/4 animate-pulse"></div>
            <div className="h-3 bg-slate-100 rounded-md mb-3 w-full animate-pulse"></div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="h-3 bg-slate-100 rounded w-20 animate-pulse"></span>
              <span className="h-3 bg-slate-100 rounded w-16 animate-pulse"></span>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Placeholder Card 2 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-sky-300 hover:shadow-xl transition-shadow cursor-pointer bg-white"
        >
          {/* Portfolio Preview Area */}
          <div className="h-48 bg-linear-to-br from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <FiEye className="w-4 h-4 text-violet-600" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <FiEdit3 className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>
          {/* Portfolio Info */}
          <div className="p-4">
            <div className="h-5 bg-slate-200 rounded-md mb-2 w-2/3 animate-pulse"></div>
            <div className="h-3 bg-slate-100 rounded-md mb-3 w-full animate-pulse"></div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="h-3 bg-slate-100 rounded w-20 animate-pulse"></span>
              <span className="h-3 bg-slate-100 rounded w-16 animate-pulse"></span>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Placeholder Card 3 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-sky-300 hover:shadow-xl transition-shadow cursor-pointer bg-white"
        >
          {/* Portfolio Preview Area */}
          <div className="h-48 bg-linear-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <FiEye className="w-4 h-4 text-orange-600" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <FiEdit3 className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>
          {/* Portfolio Info */}
          <div className="p-4">
            <div className="h-5 bg-slate-200 rounded-md mb-2 w-4/5 animate-pulse"></div>
            <div className="h-3 bg-slate-100 rounded-md mb-3 w-full animate-pulse"></div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="h-3 bg-slate-100 rounded w-20 animate-pulse"></span>
              <span className="h-3 bg-slate-100 rounded w-16 animate-pulse"></span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
