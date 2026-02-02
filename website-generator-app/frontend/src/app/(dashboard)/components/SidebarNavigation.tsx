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
    FiChevronDown,
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
    const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

    // Make GET request to fetch portfolios count
    useEffect(() => {
        if (!user?.id) return;

        const fetchPortfoliosCount = async () => {
            try {
                // Make api call
                const response: Response = await fetch(
                    `/api/portfolio/list?userId=${user.id}`,
                    {
                        method: "GET",
                    },
                );

                if (!response.ok)
                    throw new Error(`HTTP error! status: ${response.status}`);

                const json = await response.json();

                // Update state with count
                setPortfoliosCount(json.portfolios.length);
            } catch (err) {
                console.error("Error fetching portfolios:", err);
                alert("Failed to fetch portfolios. Please try again.");
            }
        };

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

    const secondaryItems: NavItem[] = [];

    const NavItemComponent = ({ item }: { item: NavItem }) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;

        return (
            <Link href={item.path} onClick={() => setMobileOpen(false)}>
                <motion.div
                    whileHover={{
                        x: collapsed ? 0 : 4,
                        scale: collapsed ? 1.05 : 1,
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl group relative overflow-hidden ${
                        isActive
                            ? "bg-white/10 text-white shadow-lg shadow-white/5"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
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
                                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-linear-to-r from-blue-600 to-blue-500 text-white relative z-10 transition-all duration-200 shadow-lg">
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
                className={`px-6 pt-6 pb-2 border-b border-white/10 ${collapsed ? "px-4" : ""}`}
            >
                {/* User Profile */}
                {!collapsed && (
                    <div className="px-3 pb-3 relative">
                        {/* Profile Section */}
                        <div className="flex items-center gap-3">
                            {/* Avatar on the left */}
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="User Avatar"
                                    className="w-8 h-8 rounded-full border-2 border-white/20 object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 flex-shrink-0">
                                    <FiUser className="w-4 h-4 text-white/60" />
                                </div>
                            )}

                            {/* Stacked Text */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-bold text-white mb-0.5">
                                    PortRN
                                </h2>
                                <p className="text-xs text-white/60 truncate">
                                    {email}
                                </p>
                            </div>

                            {/* Dropdown Button */}
                            <button
                                onClick={() =>
                                    setShowProfileMenu(!showProfileMenu)
                                }
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <FiChevronDown
                                    className={`w-4 h-4 text-white/70 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                                />
                            </button>
                        </div>

                        {/* Dropdown Menu */}
                        {showProfileMenu && (
                            <div className="absolute top-full left-3 right-3 mt-2 bg-[#1a1d21] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                                <Link
                                    href="/dashboard-user/settings"
                                    onClick={() => setShowProfileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/10"
                                >
                                    <FiSettings className="w-4 h-4 text-white/70" />
                                    <span className="text-sm text-white">
                                        Profile Settings
                                    </span>
                                </Link>
                                <Link
                                    href="/dashboard-user/help"
                                    onClick={() => setShowProfileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                                >
                                    <FiHelpCircle className="w-4 h-4 text-white/70" />
                                    <span className="text-sm text-white">
                                        Help & Support
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {collapsed && (
                    <div className="flex justify-center pb-3">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full border-2 border-white/20 object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 flex-shrink-0">
                                <FiUser className="w-4 h-4 text-white/60" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {navItems.map((item) => (
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
                    {!collapsed && (
                        <span className="text-sm font-medium">Sign Out</span>
                    )}
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
                            <span className="text-sm font-medium">
                                Collapse
                            </span>
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
