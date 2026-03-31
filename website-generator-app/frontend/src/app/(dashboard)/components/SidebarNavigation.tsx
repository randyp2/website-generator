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
}) => {
    const { user } = useUser(); // Extract user from context

    // Extract user info
    const { username } = user;
    const { email } = user;
    const { avatar } = user;

    const pathname = usePathname();
    const router = useRouter();
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

    const collapsed = externalCollapsed ?? false;

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
                    whileHover={{ scale: collapsed ? 1.05 : 1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md group relative ${
                        isActive
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                >
                    <div
                        className={`flex items-center justify-center ${
                            collapsed ? "w-full" : ""
                        }`}
                    >
                        <Icon
                            className={`w-5 h-5 transition-all duration-200 ${
                                isActive
                                    ? "text-white"
                                    : "text-white/70 group-hover:text-white"
                            }`}
                        />
                    </div>

                    {!collapsed && (
                        <>
                            <span
                                className={`flex-1 text-sm font-medium relative z-10 transition-all duration-200 ${
                                    isActive
                                        ? "text-white"
                                        : "text-white/70 group-hover:text-white"
                                }`}
                            >
                                {item.label}
                            </span>

                            {item.badge && (
                                <span className="rounded-sm bg-blue-500/80 px-2 py-0.5 text-xs font-bold text-white transition-all duration-200">
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
                className={`border-b border-white/10 px-5 pt-5 pb-2 ${collapsed ? "px-3" : ""}`}
            >
                {/* Product Name */}
                {!collapsed && (
                    <div className="px-3 pb-3">
                        <h2 className="text-base font-bold tracking-wide text-white">
                            PortRN
                        </h2>
                    </div>
                )}

                {collapsed && (
                    <div className="flex justify-center pb-3">
                        <div className="h-8 w-8 rounded-md border border-white/15 bg-white/5" />
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
                {navItems.map((item) => (
                    <NavItemComponent key={item.id} item={item} />
                ))}
            </div>

            {/* Profile Menu */}
            <div className="relative border-t border-white/10 p-4">
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`hover:cursor-pointer w-full flex items-center gap-3 px-1 py-1.5 transition-colors hover:text-white ${
                        collapsed ? "justify-center" : ""
                    }`}
                >
                    {avatar ? (
                        <img
                            src={avatar}
                            alt="User Avatar"
                            className="h-8 w-8 rounded-full border border-white/20 object-cover"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                            <FiUser className="h-4 w-4 text-white/70" />
                        </div>
                    )}

                    {!collapsed && (
                        <>
                            <div className="min-w-0 flex-1 text-left">
                                <p className="truncate text-sm font-medium text-white">
                                    {username || "Account"}
                                </p>
                                <p className="truncate text-xs text-white/60">
                                    {email}
                                </p>
                            </div>
                            <FiChevronDown
                                className={`h-4 w-4 text-white/70 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                            />
                        </>
                    )}
                </motion.button>

                {showProfileMenu && (
                    <div className="absolute bottom-full left-4 right-4 mb-2 overflow-hidden rounded-lg border border-white/10 bg-[#111318] shadow-2xl z-50">
                        {[
                            { icon: FiUser, label: "Sign Up" },
                            { icon: FiSettings, label: "Settings" },
                            { icon: FiShare2, label: "Pricing" },
                            { icon: FiHelpCircle, label: "Help" },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setShowProfileMenu(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/80 hover:bg-white/5 transition-colors"
                            >
                                <item.icon className="h-4 w-4 text-white/70" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}

                        <button
                            onClick={async () => {
                                setShowProfileMenu(false);
                                await signoutClient();
                                router.push("/login");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-300 hover:bg-red-500/10 transition-colors border-t border-white/10"
                        >
                            <FiLogOut className="h-4 w-4" />
                            <span className="text-sm">Sign Out</span>
                        </button>
                    </div>
                )}
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
                className="md:hidden fixed top-4 left-4 z-50 p-3 bg-black/80 rounded-lg shadow-lg border border-white/10"
            >
                <FiMenu className="w-6 h-6 text-white" />
            </motion.button>

            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 72 : 248 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden md:block fixed left-0 top-0 h-screen bg-black border-r border-white/10 z-40 shadow-2xl shadow-black/40"
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
                            initial={{ x: -248 }}
                            animate={{ x: 0 }}
                            exit={{ x: -248 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="md:hidden fixed left-0 top-0 h-screen w-[248px] bg-black border-r border-white/10 z-50 shadow-2xl shadow-black/40"
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
