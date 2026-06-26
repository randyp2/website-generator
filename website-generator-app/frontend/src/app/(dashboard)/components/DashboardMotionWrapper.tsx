"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardMotionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that need full width without max-width constraint
  const fullWidthPages = ["/dashboard/create/refine"];
  const isFullWidth = fullWidthPages.some((page) => pathname.includes(page));

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={isFullWidth ? "" : "mx-auto w-full max-w-[82.5rem]"}
    >
      {children}
    </motion.div>
  );
}
