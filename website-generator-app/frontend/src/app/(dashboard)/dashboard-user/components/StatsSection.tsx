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
          transition={{ delay: 0.1 * index, duration: 0.5 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative group"
        >
          {/* Glass Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all">
            {/* Icon Badge */}
            <div
              className={`w-12 h-12 rounded-xl bg-linear-to-br from-${stat.color}-100 to-${stat.color}-200 flex items-center justify-center text-${stat.color}-600 mb-4 group-hover:scale-110 transition-transform`}
            >
              {stat.icon}
            </div>

            {/* Stat Value */}
            <div className="mb-2">
              <div className="text-3xl font-bold text-slate-900">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-slate-600">
                {stat.label}
              </div>
            </div>

            {/* Change Indicator */}
            <div className="text-xs text-slate-500">{stat.change}</div>

            {/* Hover Glow Effect */}
            <div
              className={`absolute inset-0 rounded-2xl bg-linear-to-r from-${stat.color}-400/0 to-${stat.color}-400/0 group-hover:from-${stat.color}-400/5 group-hover:to-${stat.color}-400/10 transition-all pointer-events-none`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
