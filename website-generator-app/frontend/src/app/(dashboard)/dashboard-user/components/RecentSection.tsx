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
      className="relative bg-white/5 rounded-2xl p-8 border border-white/10 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <FiFolder className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Recent Portfolios
          </h2>
        </div>
        <button className="text-white/70 hover:text-white font-medium text-sm hover:underline transition-all">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Portfolio Placeholder Card 1 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-white/30 hover:shadow-xl transition-shadow cursor-pointer bg-white/5"
        >
          {/* Portfolio Preview Area */}
          <div className="h-48 bg-linear-to-br from-white/5 via-white/0 to-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
                <FiEye className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
                <FiEdit3 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          {/* Portfolio Info */}
          <div className="p-4">
            <div className="h-5 bg-white/15 rounded-md mb-2 w-3/4"></div>
            <div className="h-3 bg-white/10 rounded-md mb-3 w-full"></div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="h-3 bg-white/10 rounded w-20"></span>
              <span className="h-3 bg-white/10 rounded w-16"></span>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Placeholder Card 2 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-white/30 hover:shadow-xl transition-shadow cursor-pointer bg-white/5"
        >
          {/* Portfolio Preview Area */}
          <div className="h-48 bg-linear-to-br from-white/5 via-white/0 to-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
                <FiEye className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
                <FiEdit3 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          {/* Portfolio Info */}
          <div className="p-4">
            <div className="h-5 bg-white/15 rounded-md mb-2 w-2/3"></div>
            <div className="h-3 bg-white/10 rounded-md mb-3 w-full"></div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="h-3 bg-white/10 rounded w-20"></span>
              <span className="h-3 bg-white/10 rounded w-16"></span>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Placeholder Card 3 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-white/30 hover:shadow-xl transition-shadow cursor-pointer bg-white/5"
        >
          {/* Portfolio Preview Area */}
          <div className="h-48 bg-linear-to-br from-white/5 via-white/0 to-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
                <FiEye className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex itemsCenter justifyCenter shadow-lg border border-white/10">
                <FiEdit3 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          {/* Portfolio Info */}
          <div className="p-4">
            <div className="h-5 bg-white/15 rounded-md mb-2 w-4/5"></div>
            <div className="h-3 bg-white/10 rounded-md mb-3 w-full"></div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="h-3 bg-white/10 rounded w-20"></span>
              <span className="h-3 bg-white/10 rounded w-16"></span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
