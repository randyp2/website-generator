"use client";

import { motion } from "framer-motion";
import React from "react";

export const HeaderSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full text-sky-700 font-semibold text-sm mb-4">
        Step 2 of 3
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
        Upload Your Content
      </h1>
      <p className="text-lg text-slate-600">
        Upload your resume and media files to help{" "}
        <span className="text-2xl font-semibold text-sky-400">AI</span>{" "}
        personalize your portfolio. You can always add more later.
      </p>
    </motion.div>
  );
};
