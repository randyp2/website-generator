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
      color: "from-chart-1 to-chart-2",
    },
    {
      label: "Edits",
      value: 89,
      icon: <FiEdit3 className="w-4 h-4" />,
      color: "from-chart-2 to-chart-3",
    },
    {
      label: "Shares",
      value: 34,
      icon: <FiShare2 className="w-4 h-4" />,
      color: "from-chart-4 to-chart-5",
    },
  ];

  const total = activityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="relative rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Activity Breakdown</h3>
          <p className="text-sm text-muted-foreground">Portfolio interactions this month</p>
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
                <div className="text-card-foreground/70">
                  {item.icon}
                </div>

                {/* Bar container */}
                <div className="flex-1 relative">
                  <div className="h-14 w-full overflow-hidden rounded-lg bg-muted/40">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                      className={`h-full bg-linear-to-r ${item.color} rounded-lg transition-all relative`}
                    >
                      {/* Label and value inside the bar */}
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <span className="text-sm font-medium text-primary-foreground">{item.label}</span>
                        <span className="font-bold text-primary-foreground">{item.value.toLocaleString()}</span>
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
      <div className="mt-6 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total Interactions</span>
          <span className="text-2xl font-bold text-card-foreground">{total.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};
