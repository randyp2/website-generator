"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
import { FiLayout, FiLayers, FiSettings } from "react-icons/fi";

export const ActionSection: React.FC = () => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="relative bg-white/5 rounded-2xl p-7 border border-white/10 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Browse Templates",
            desc: "Start from a preset",
            action: () => router.push("/dashboard-user/create"),
            icon: <FiLayout className="w-7 h-7 text-white" />,
          },
          {
            title: "View Portfolios",
            desc: "Manage your work",
            action: () => router.push("/dashboard-user/portfolios"),
            icon: <FiLayers className="w-7 h-7 text-white" />,
          },
          {
            title: "Customize Theme",
            desc: "Tune styles",
            action: () => router.push("/dashboard-user/theme"),
            icon: <FiSettings className="w-7 h-7 text-white" />,
          },
        ].map((action, i) => (
          <motion.button
            key={action.title}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className="relative text-left p-5 rounded-xl border border-white/10 bg-white/5 hover:cursor-pointer hover:border-white/30 hover:bg-white/10 transition-all group shadow-[0_10px_30px_rgba(0,0,0,0.25)] flex items-center gap-3"
          >
            <div className="flex flex-col items-start">
              <div className="shrink-0">{action.icon}</div>
              <div className="mt-2 space-y-1">
                <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors wrap-break-word line-clamp-1">
                  {action.title}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed wrap-break-word line-clamp-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                  {action.desc}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
