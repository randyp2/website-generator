"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { FiZap, FiX } from "react-icons/fi";

interface AiResponseProps {
  currentAIResponse: string | null;
  setCurrentAIResponse: React.Dispatch<React.SetStateAction<string | null>>;
  chatDrawerOpen: boolean;
  setChatDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AiResponse: React.FC<AiResponseProps> = ({
  currentAIResponse,
  setCurrentAIResponse,
  chatDrawerOpen,
  setChatDrawerOpen,
}) => {
  return (
    <AnimatePresence>
      {currentAIResponse && !chatDrawerOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute top-6 left-6 z-40 max-w-md"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-xl p-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FiZap className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold text-slate-600">
                  PortfolioAI
                </span>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setChatDrawerOpen(true)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                >
                  View History
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentAIResponse(null)}
                  className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center"
                >
                  <FiX className="w-3 h-3 text-slate-600" />
                </motion.button>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {currentAIResponse}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
