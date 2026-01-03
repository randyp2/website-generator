"use client";

import { motion } from "framer-motion";
import React from "react";
import { FiFolder, FiTrendingUp, FiDownload, FiGlobe } from "react-icons/fi";

// Mock data - replace with real user stats
const stats = [
  {
    label: "Portfolios",
    value: "12",
    icon: <FiFolder className="w-5 h-5" />,
    color: "sky",
    change: "+3 this month",
  },
  {
    label: "Total Views",
    value: "2.4K",
    icon: <FiTrendingUp className="w-5 h-5" />,
    color: "teal",
    change: "+14% vs last month",
  },
  {
    label: "Exports",
    value: "8",
    icon: <FiDownload className="w-5 h-5" />,
    color: "cyan",
    change: "Last export 2 days ago",
  },
  {
    label: "Deployed",
    value: "5",
    icon: <FiGlobe className="w-5 h-5" />,
    color: "violet",
    change: "3 active live sites",
  },
];

export const StatsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            opacity: { delay: 0.1 * index, duration: 0.5 },
            y: { type: "spring", stiffness: 400, damping: 30 }
          }}
          whileHover={{ y: -4 }}
          className="relative group"
        >
          {/* Glass Card */}
          <div className="relative bg-white/5 rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-xl transition-shadow">
            {/* Icon Badge */}
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>

            {/* Stat Value */}
            <div className="mb-2">
              <div className="text-3xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-white/70">
                {stat.label}
              </div>
            </div>

            {/* Change Indicator */}
            <div className="text-xs text-white/60">{stat.change}</div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/5 transition-shadow pointer-events-none" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
