"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
  inline?: boolean;
  activeName?: string;
  onActiveChange?: (name: string) => void;
}

export function NavBar({
  items,
  className,
  inline = false,
  activeName,
  onActiveChange,
}: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? "");
  const selectedTab = activeName ?? activeTab;

  const handleSelect = (name: string) => {
    setActiveTab(name);
    onActiveChange?.(name);
  };

  return (
    <div
      className={cn(
        inline
          ? "static translate-x-0"
          : "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-200 mb-6 sm:pt-6 h-max",
        className,
      )}
    >
      <div className="flex items-center gap-3 rounded-full border border-sidebar-border bg-sidebar/80 px-1 py-1 backdrop-blur-lg shadow-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = selectedTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => handleSelect(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                isActive && "bg-primary text-primary-foreground shadow-sm",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full rounded-full bg-primary/20 -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full bg-primary">
                    <div className="absolute w-12 h-6 rounded-full bg-primary/40 blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 rounded-full bg-primary/35 blur-md -top-1" />
                    <div className="absolute w-4 h-4 rounded-full bg-primary/35 blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
