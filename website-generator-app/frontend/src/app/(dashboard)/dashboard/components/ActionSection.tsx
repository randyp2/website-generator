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
      className="relative rounded-2xl border border-border bg-card/80 p-7 shadow-lg"
    >
      <h2 className="mb-6 text-2xl font-bold text-card-foreground">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Browse Templates",
            desc: "Start from a preset",
            action: () => router.push("/dashboard/create"),
            icon: <FiLayout className="h-7 w-7 text-primary" />,
          },
          {
            title: "View Portfolios",
            desc: "Manage your work",
            action: () => router.push("/dashboard/portfolios"),
            icon: <FiLayers className="h-7 w-7 text-primary" />,
          },
          {
            title: "Customize Theme",
            desc: "Tune styles",
            action: () => router.push("/dashboard/theme"),
            icon: <FiSettings className="h-7 w-7 text-primary" />,
          },
        ].map((action) => (
          <motion.button
            key={action.title}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/70 p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:bg-muted/40"
          >
            <div className="flex flex-col items-start">
              <div className="shrink-0">{action.icon}</div>
              <div className="mt-2 space-y-1">
                <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors wrap-break-word">
                  {action.title}
                </h3>
                <p className="line-clamp-2 translate-y-1 text-xs leading-relaxed text-muted-foreground opacity-0 transition-all duration-200 wrap-break-word group-hover:translate-y-0 group-hover:opacity-100">
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
