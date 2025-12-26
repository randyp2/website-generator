"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiHome,
  FiFolder,
  FiUpload,
  FiSliders,
  FiShare2,
  FiSettings,
  FiHelpCircle,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { MdOutlineCreate } from "react-icons/md";
import { IconType } from "react-icons";
import { createClient } from "@/utils/supabase/client";
import { signoutClient } from "@/lib/logout-client";
import { useUser } from "@/context/UserContext";

interface NavItem {
  id: string;
  label: string;
  icon: IconType;
  path: string;
  badge?: string | number;
}

interface SidebarNavigationProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  collapsed: externalCollapsed,
  onToggleCollapse,
}) => {

  const { user } = useUser(); // Extract user from context

  // Extract user info
  const { username } = user;
  const { email } = user;
  const { avatar } = user;

  const pathname = usePathname();
  const router = useRouter();
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [portfoliosCount, setPortfoliosCount] = useState<number>(0); 

  // Make GET request to fetch portfolios count
  useEffect(() => {
    if (!user?.id) return; 

    const fetchPortfoliosCount = async () => {
      try {

        // Make api call
        const response: Response = await fetch(`/api/portfolio/list?userId=${user.id}`, {
          method: "GET",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        
        // Update state with count
        setPortfoliosCount(json.portfolios.length);

      } catch (err) {
        console.error("Error fetching portfolios:", err);
        alert("Failed to fetch portfolios. Please try again.");
      }
    }

    fetchPortfoliosCount();
  }, []);



  // Use external collapsed state if provided, otherwise use internal
  const collapsed = externalCollapsed ?? internalCollapsed;
  const handleToggle =
    onToggleCollapse ?? (() => setInternalCollapsed(!internalCollapsed));

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Dashboard",
      icon: FiHome,
      path: "/dashboard-user",
    },
    {
      id: "portfolios",
      label: "My Portfolios",
      icon: FiFolder,
      path: "/dashboard-user/portfolios",
      badge: portfoliosCount,
    },
    {
      id: "create",
      label: "Create New",
      icon: MdOutlineCreate,
      path: "/dashboard-user/create",
    },
    {
      id: "export",
      label: "Export & Share",
      icon: FiShare2,
      path: "/dashboard-user/export",
    },
  ];

  const secondaryItems: NavItem[] = [
    {
      id: "settings",
      label: "Settings",
      icon: FiSettings,
      path: "/dashboard-user/settings",
    },
    {
      id: "help",
      label: "Help & Support",
      icon: FiHelpCircle,
      path: "/dashboard-user/help",
    },
  ];

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.path;
    const Icon = item.icon;

    return (
      <Link href={item.path} onClick={() => setMobileOpen(false)}>
        <motion.div
          whileHover={{ x: collapsed ? 0 : 4, scale: collapsed ? 1.05 : 1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl group relative overflow-hidden ${
            isActive
              ? "bg-white/10 text-white shadow-lg shadow-white/5 border border-white/20"
              : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10"
          }`}
        >
          {isActive && (
            <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 bg-linear-to-br from-white/10 via-white/5 to-transparent blur-2xl" />
          )}
          <div
            className={`flex items-center justify-center relative z-10 ${
              collapsed ? "w-full" : ""
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-all duration-200 ${
                isActive
                  ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                  : "text-white/70 group-hover:text-white group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
              }`}
            />
          </div>

          {!collapsed && (
            <>
              <span
                className={`flex-1 font-medium relative z-10 transition-all duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-white/70 group-hover:text-white"
                }`}
              >
                {item.label}
              </span>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full relative z-10 transition-all duration-200 ${
                    isActive
                      ? "bg-white/20 text-white border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                      : "bg-white/10 text-white/80 border border-white/20"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </motion.div>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div
        className={`p-6 border-b border-white/10 ${collapsed ? "px-4" : ""}`}
      >
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3 mb-4">
            <span className="text-xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              PortfolioAI
            </span>
          </Link>
        )}

        {/* User Info */}
        {!collapsed && (
          <div className="relative overflow-hidden flex items-center gap-3 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="pointer-events-none absolute -left-6 -top-6 h-16 w-16 bg-linear-to-br from-white/10 via-transparent to-transparent blur-xl" />
            {/* Render avatar if any */}
            {avatar === null ? (
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/20">
                <FiUser className="w-4 h-4 text-white/80" />
              </div>
            ) : (
              <img src={avatar} className="w-8 h-8 rounded-full border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.15)]" />
            )}

            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-sm font-medium text-white truncate">
                {username}
              </p>
              <p className="text-xs text-white/60 truncate">{email}</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center mt-2">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <FiUser className="w-4 h-4 text-white/80" />
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavItemComponent key={item.id} item={item} />
        ))}

        {/* Divider */}
        <div className="my-6 border-t border-white/10" />

        {/* Secondary Navigation */}
        {secondaryItems.map((item) => (
          <NavItemComponent key={item.id} item={item} />
        ))}
      </div>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={async () => {
            await signoutClient();
            router.push("/login");
          }}
          className={`hover:cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:border-red-400/30 border border-transparent transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <FiLogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </motion.button>
      </div>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden md:block p-4 pt-0 pb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={handleToggle}
          className={`hover:cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? (
            <FiChevronRight className="w-5 h-5" />
          ) : (
            <>
              <FiChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white/5 rounded-xl shadow-lg border border-white/10"
      >
        <FiMenu className="w-6 h-6 text-white" />
      </motion.button>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:block fixed left-0 top-0 h-screen bg-[#0a0f14]/95 border-r border-white/10 z-40 shadow-2xl shadow-black/20"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden fixed left-0 top-0 h-screen w-[280px] bg-[#0a0f14]/95 border-r border-white/10 z-50 shadow-2xl shadow-black/20"
            >
              {/* Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              >
                <FiX className="w-5 h-5 text-white/80" />
              </button>

              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidebarNavigation;
