"use client";

import { motion } from "framer-motion";
import React from "react";

export const HeaderSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="text-center max-w-3xl mx-auto"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm mb-6">
        Step 1 of 3
      </div>
      <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
        Choose Your Starting Point
      </h1>
      <p className="pb-5 text-lg leading-relaxed text-muted-foreground">
        Pick a template that matches your style, or start from scratch.
        Customize it further with{" "}
        <span className="text-2xl font-semibold text-primary">AI</span> in the
        next step.
      </p>
    </motion.div>
  );
};
