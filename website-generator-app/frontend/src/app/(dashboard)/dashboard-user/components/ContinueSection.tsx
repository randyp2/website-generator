"use client";

import { motion } from "framer-motion";
import React from "react";
import { FiClock, FiEdit3 } from "react-icons/fi";

export const ContinueSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-100 to-orange-200 flex items-center justify-center">
            <FiClock className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Continue Where You Left Off
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Placeholder card 1 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="group p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/30 transition-shadow cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <FiEdit3 className="w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="flex-1">
              <div className="h-6 bg-slate-200 rounded-md mb-2 w-3/4 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded-md mb-3 w-1/2 animate-pulse"></div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FiClock className="w-4 h-4" />
                <span>Last edited: --</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Placeholder card 2 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="group p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/30 transition-shadow cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <FiEdit3 className="w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="flex-1">
              <div className="h-6 bg-slate-200 rounded-md mb-2 w-2/3 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded-md mb-3 w-1/3 animate-pulse"></div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FiClock className="w-4 h-4" />
                <span>Last edited: --</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
