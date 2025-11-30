"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";

export const ActionSection: React.FC = () => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Browse Templates",
            desc: "Start from a beautiful preset",
            action: () => router.push("/dashboard-user/create"),
          },
          {
            title: "View Portfolios",
            desc: "Manage your creations",
            action: () => router.push("/dashboard-user/portfolios"),
          },
          {
            title: "Customize Theme",
            desc: "Make it uniquely yours",
            action: () => router.push("/dashboard-user/theme"),
          },
        ].map((action, i) => (
          <motion.button
            key={action.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className="text-left p-6 rounded-xl border-2 border-slate-200 hover:cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition-all group"
          >
            <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-sky-600 transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-slate-600">{action.desc}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
