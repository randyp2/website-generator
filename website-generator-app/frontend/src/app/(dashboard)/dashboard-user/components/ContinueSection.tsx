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
      className="relative bg-white/5 rounded-2xl p-8 border border-white/10 shadow-lg min-h-[360px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <FiClock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Continue Where You Left Off
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Placeholder card 1 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="group p-6 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-shadow cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
              <FiEdit3 className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <div className="h-6 bg-white/10 rounded-md mb-2 w-3/4"></div>
              <div className="h-4 bg-white/5 rounded-md mb-3 w-1/2"></div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <FiClock className="w-4 h-4" />
                <span>Last edited: --</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Placeholder card 2 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="group p-6 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-shadow cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
              <FiEdit3 className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <div className="h-6 bg-white/10 rounded-md mb-2 w-2/3"></div>
              <div className="h-4 bg-white/5 rounded-md mb-3 w-1/3"></div>
              <div className="flex items-center gap-2 text-sm text-white/60">
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
