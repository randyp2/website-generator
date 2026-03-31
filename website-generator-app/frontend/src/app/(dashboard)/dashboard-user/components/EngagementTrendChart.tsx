"use client";

import { motion } from "framer-motion";
import React from "react";

export const EngagementTrendChart: React.FC = () => {
  // Weekly data - can be replaced with real data from API
  const weeklyData = [20, 35, 28, 42, 38, 50];
  const maxValue = Math.max(...weeklyData);
  const yAxisLabels = [0, 15, 30, 45, 60];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="relative rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Engagement Trend</h3>
          <p className="text-sm text-muted-foreground">Views and exports over time</p>
        </div>
      </div>
      <div className="mt-4 h-48 rounded-xl relative">
        {/* Y-axis labels */}
        <div className="absolute bottom-6 left-0 top-0 flex flex-col justify-between text-[10px] text-muted-foreground/70">
          {yAxisLabels.reverse().map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        {/* Horizontal grid lines */}
        <div className="absolute left-8 right-2 top-0 bottom-6 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-px w-full bg-border/70" />
          ))}
        </div>

        {/* Vertical grid lines */}
        <div className="absolute left-8 right-2 top-0 bottom-6 flex justify-between">
          {weeklyData.map((_, i) => (
            <div key={i} className="h-full w-px bg-border/40" />
          ))}
        </div>

        {/* Chart area */}
        <div className="absolute left-8 right-2 top-0 bottom-6">
          <svg className="w-full h-full" preserveAspectRatio="none">
            {/* Line path */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--chart-2)" />
                <stop offset="100%" stopColor="var(--chart-1)" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area under line */}
            <path
              d={`M 0,${100 - (weeklyData[0] / maxValue) * 100} ${weeklyData.map((val, i) => `L ${(i / (weeklyData.length - 1)) * 100},${100 - (val / maxValue) * 100}`).join(' ')} L 100,100 L 0,100 Z`}
              fill="url(#areaGradient)"
              vectorEffect="non-scaling-stroke"
            />

            {/* Line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              d={`M 0,${100 - (weeklyData[0] / maxValue) * 100} ${weeklyData.map((val, i) => `L ${(i / (weeklyData.length - 1)) * 100},${100 - (val / maxValue) * 100}`).join(' ')}`}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />

            {/* Data points */}
            {weeklyData.map((val, i) => (
              <motion.circle
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                cx={`${(i / (weeklyData.length - 1)) * 100}`}
                cy={`${100 - (val / maxValue) * 100}`}
                r="3"
                fill="var(--chart-1)"
                className="drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]"
              />
            ))}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-8 right-2 flex justify-between text-[10px] text-muted-foreground/70">
          {weeklyData.map((_, i) => (
            <span key={i}>{`W${i + 1}`}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
