"use client";

import { motion } from "framer-motion";
import React from "react";

export const HeaderSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="text-center mb-8"
    >
      <div className="upload-flow-header-pill inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-sm mb-6">
        Step 2 of 3
      </div>
      <h1 className="upload-flow-title text-4xl md:text-5xl font-bold mb-6">
        Upload Your Content
      </h1>
      <p className="upload-flow-copy text-lg leading-relaxed">
        Resume parsing is disabled in this mock flow. You can skip the resume step and continue with placeholder profile data, or optionally add media and video files for layout preview only.
      </p>
    </motion.div>
  );
};
