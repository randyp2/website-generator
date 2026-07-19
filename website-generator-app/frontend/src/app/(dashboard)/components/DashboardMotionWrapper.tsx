"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardMotionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The page-transition key drives a remount-and-fade on navigation. Sections
  // that own a persistent sub-navigation (e.g. the settings tabs, whose sliding
  // underline lives in a shared layout) must collapse to a single key, so
  // switching sub-tabs swaps only the content instead of remounting the whole
  // subtree (which would tear down the sub-nav and kill its animation).
  const persistentSections = ["/dashboard/settings"];
  const transitionKey =
    persistentSections.find((section) => pathname.startsWith(section)) ??
    pathname;

  // Pages that need full width without max-width constraint
  const fullWidthPages = ["/dashboard/create/refine"];
  const isFullWidth = fullWidthPages.some((page) => pathname.includes(page));

  // Pages that orchestrate their own intro (e.g. the style chat's gradient
  // ignition); the page-level fade would flatten it into one opacity ramp.
  const selfAnimatedPages = ["/dashboard/create/style"];
  const isSelfAnimated = selfAnimatedPages.some((page) => pathname.includes(page));

  const widthClass = isFullWidth
    ? "h-full min-h-0 overflow-hidden"
    : "mx-auto w-full max-w-[82.5rem]";

  if (isSelfAnimated) {
    return <div className={widthClass}>{children}</div>;
  }

  return (
    <motion.div
      key={transitionKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={widthClass}
    >
      {children}
    </motion.div>
  );
}
