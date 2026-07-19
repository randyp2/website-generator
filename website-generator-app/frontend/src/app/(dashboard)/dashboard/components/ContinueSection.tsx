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
      className="relative flex min-h-[360px] flex-col rounded-2xl border border-border bg-card/80 p-5 shadow-lg md:p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FiClock className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-card-foreground md:text-xl">
            Continue Where You Left Off
          </h2>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
        {/* Placeholder card 1 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="group cursor-pointer rounded-xl border border-border bg-background/70 p-5 transition-shadow hover:border-primary/40 hover:bg-muted/40"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FiEdit3 className="h-6 w-6 transition-colors group-hover:text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-2 h-6 w-3/4 rounded-md bg-muted"></div>
              <div className="mb-3 h-4 w-1/2 rounded-md bg-muted/60"></div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiClock className="h-4 w-4" />
                <span>Last edited: --</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Placeholder card 2 */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="group cursor-pointer rounded-xl border border-border bg-background/70 p-5 transition-shadow hover:border-primary/40 hover:bg-muted/40"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FiEdit3 className="h-6 w-6 transition-colors group-hover:text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-2 h-6 w-2/3 rounded-md bg-muted"></div>
              <div className="mb-3 h-4 w-1/3 rounded-md bg-muted/60"></div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiClock className="h-4 w-4" />
                <span>Last edited: --</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
