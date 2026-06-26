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
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20 font-semibold text-sm mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
        Step 2 of 3
      </div>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] md:text-4xl">
        Upload Your Content
      </h1>
      <p className="text-sm leading-6 text-white/80 md:text-base">
        Upload your resume and media files to help{" "}
        <span className="font-semibold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">AI</span>{" "}
        personalize your portfolio. You can always add more later.
      </p>
    </motion.div>
  );
};
