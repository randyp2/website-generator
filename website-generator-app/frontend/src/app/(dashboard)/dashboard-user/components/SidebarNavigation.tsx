"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    FiHome,
    FiFolder,
    FiZap,
    FiUpload,
    FiSliders,
    FiShare2,
    FiSettings,
    FiHelpCircle,
    FiMenu,
    FiX,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import { IconType } from "react-icons";

/**
 * SIDEBAR NAVIGATION - Next.js App Router Compatible
 * 
 * Design Goals:
 * - Persistent navigation for dashboard
 * - Collapsible for more screen space
 * - Active state clearly visible
 * - Icon-only mode for minimal UI
 * - Mobile: overlay drawer
 * - Smooth transitions
 */

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
    const pathname = usePathname();
    const router = useRouter();
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Use external collapsed state if provided, otherwise use internal
    const collapsed = externalCollapsed ?? internalCollapsed;
    const handleToggle = onToggleCollapse ?? (() => setInternalCollapsed(!internalCollapsed));

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
            badge: 12,
        },
        {
            id: "create",
            label: "Create New",
            icon: FiZap,
            path: "/dashboard-user/create",
        },
        {
            id: "uploads",
            label: "Uploads",
            icon: FiUpload,
            path: "/dashboard-user/uploads",
        },
        {
            id: "theme",
            label: "Theme",
            icon: FiSliders,
            path: "/dashboard-user/theme",
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                            ? "bg-linear-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-400/30"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                >
                    <div
                        className={`flex items-center justify-center ${collapsed ? "w-full" : ""
                            }`}
                    >
                        <Icon
                            className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                                }`}
                        />

                    </div>

                    {!collapsed && (
                        <>
                            <span
                                className={`flex-1 font-medium ${isActive ? "text-white" : "text-slate-700 group-hover:text-slate-900"
                                    }`}
                            >
                                {item.label}
                            </span>

                            {item.badge && (
                                <span
                                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-slate-200 text-slate-700"
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
            <div className={`p-6 border-b border-slate-200 ${collapsed ? "px-4" : ""}`}>
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-sky-300/30 shrink-0">
                        <FiZap className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            PortfolioAI
                        </span>
                    )}
                </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <NavItemComponent key={item.id} item={item} />
                ))}

                {/* Divider */}
                <div className="my-6 border-t border-slate-200" />

                {/* Secondary Navigation */}
                {secondaryItems.map((item) => (
                    <NavItemComponent key={item.id} item={item} />
                ))}
            </div>

            {/* Collapse Toggle (Desktop) */}
            <div className="hidden md:block p-4 border-t border-slate-200">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleToggle}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all ${collapsed ? "justify-center" : ""
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
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-slate-200"
            >
                <FiMenu className="w-6 h-6 text-slate-700" />
            </motion.button>

            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 80 : 280 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden md:block fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-40"
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
                            className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="md:hidden fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-slate-200 z-50"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <FiX className="w-5 h-5 text-slate-600" />
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