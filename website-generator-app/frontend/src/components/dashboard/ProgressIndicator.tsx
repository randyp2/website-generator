"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

interface ProgressIndicatorProps {
  currentStep: number;
  steps: { title: string }[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full bg-linear-to-r from-cyan-500 to-teal-600"
          />
        </div>

        {/* Step Indicators */}
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                index === currentStep
                  ? "bg-linear-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30 scale-110"
                  : index < currentStep
                  ? "bg-cyan-500 text-white shadow-md"
                  : "bg-white border-2 border-slate-300 text-slate-500"
              }`}
            >
              {index < currentStep ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <FiCheck className="w-5 h-5" />
                </motion.div>
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`text-xs mt-2 font-medium transition-colors ${
                index === currentStep
                  ? "text-cyan-600"
                  : index < currentStep
                  ? "text-slate-700"
                  : "text-slate-400"
              }`}
            >
              {step.title}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;