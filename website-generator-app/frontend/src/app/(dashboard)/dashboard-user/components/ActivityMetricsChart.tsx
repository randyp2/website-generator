"use client";

import { motion } from "framer-motion";
import React from "react";
import { FiEye, FiEdit3, FiShare2 } from "react-icons/fi";

export const ActivityMetricsChart: React.FC = () => {
  const activityData = [
    {
      label: "Views",
      value: 1240,
      icon: <FiEye className="w-4 h-4" />,
      color: "from-blue-600 to-blue-500",
    },
    {
      label: "Edits",
      value: 89,
      icon: <FiEdit3 className="w-4 h-4" />,
      color: "from-blue-600 to-blue-500",
    },
    {
      label: "Shares",
      value: 34,
      icon: <FiShare2 className="w-4 h-4" />,
      color: "from-blue-600 to-blue-500",
    },
  ];

  const total = activityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="relative bg-white/5 rounded-2xl p-6 border border-white/10 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Activity Breakdown</h3>
          <p className="text-sm text-white/60">Portfolio interactions this month</p>
        </div>
      </div>

      <div className="mt-4 h-48 flex items-center justify-center">
        {/* Horizontal bar visualization */}
        <div className="w-full space-y-3">
          {activityData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            return (
              <div key={item.label} className="flex items-center gap-3">
                {/* Icon on the left */}
                <div className="text-white/70">
                  {item.icon}
                </div>

                {/* Bar container */}
                <div className="flex-1 relative">
                  <div className="w-full bg-white/5 rounded-lg h-14 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                      className={`h-full bg-linear-to-r ${item.color} rounded-lg transition-all relative`}
                    >
                      {/* Label and value inside the bar */}
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <span className="text-white font-medium text-sm">{item.label}</span>
                        <span className="text-white font-bold">{item.value.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total Display */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-white/60">Total Interactions</span>
          <span className="text-2xl font-bold text-white">{total.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};
