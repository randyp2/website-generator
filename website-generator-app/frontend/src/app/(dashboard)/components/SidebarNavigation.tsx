"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    FiGrid,
    FiFolder,
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
import { signoutClient } from "@/lib/logout-client";
import { useUser } from "@/context/UserContext";
import BrandWordmark from "@/components/branding/BrandWordmark";
import { ThemeModeToggle } from "@/components/theme/ThemeModeToggle";

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
    }, [user?.id]);

    const collapsed = externalCollapsed ?? false;

    const navItems: NavItem[] = [
        {
            id: "home",
            label: "Dashboard",
            icon: FiGrid,
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
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-primary/25 hover:text-sidebar-primary-foreground"
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
                                    ? "text-sidebar-primary-foreground"
                                    : "text-sidebar-foreground/70 group-hover:text-sidebar-primary-foreground"
                            }`}
                        />
                    </div>

                    {!collapsed && (
                        <>
                            <span
                                className={`flex-1 text-sm font-medium relative z-10 transition-all duration-200 ${
                                    isActive
                                        ? "text-sidebar-primary-foreground"
                                        : "text-sidebar-foreground/70 group-hover:text-sidebar-primary-foreground"
                                }`}
                            >
                                {item.label}
                            </span>

                            {item.badge && (
                                <span className="rounded-sm bg-sidebar-accent px-2 py-0.5 text-xs font-bold text-sidebar-accent-foreground transition-all duration-200">
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
                className={`border-b border-sidebar-border px-5 pt-5 pb-2 ${collapsed ? "px-3" : ""}`}
            >
                {/* Product Name */}
                {!collapsed && (
                    <div className="px-3 pb-3">
                        <Link href="/">
                            <BrandWordmark className="text-base text-sidebar-foreground" />
                        </Link>
                    </div>
                )}

                {collapsed && (
                    <div className="flex justify-center pb-3">
                        <div className="h-8 w-8 rounded-md border border-sidebar-border bg-sidebar-accent/30" />
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
            <div className="relative border-t border-sidebar-border p-4">
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`hover:cursor-pointer w-full flex items-center gap-3 px-1 py-1.5 transition-colors hover:text-sidebar-foreground ${
                        collapsed ? "justify-center" : ""
                    }`}
                >
                    {avatar ? (
                        <Image
                            src={avatar}
                            alt="User Avatar"
                            width={32}
                            height={32}
                            unoptimized
                            className="h-8 w-8 rounded-full border border-sidebar-border object-cover"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent/30">
                            <FiUser className="h-4 w-4 text-sidebar-foreground/70" />
                        </div>
                    )}

                    {!collapsed && (
                        <>
                            <div className="min-w-0 flex-1 text-left">
                                <p className="truncate text-sm font-medium text-sidebar-foreground">
                                    {username || "Account"}
                                </p>
                                <p className="truncate text-xs text-sidebar-foreground/60">
                                    {email}
                                </p>
                            </div>
                            <FiChevronDown
                                className={`h-4 w-4 text-sidebar-foreground/70 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                            />
                        </>
                    )}
                </motion.button>

                {showProfileMenu && (
                    <div className="absolute bottom-full left-4 right-4 z-50 mb-2 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar shadow-2xl">
                        {[
                            { icon: FiUser, label: "Sign Up" },
                            { icon: FiSettings, label: "Settings" },
                            { icon: FiShare2, label: "Pricing" },
                            { icon: FiHelpCircle, label: "Help" },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setShowProfileMenu(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/40"
                            >
                                <item.icon className="h-4 w-4 text-sidebar-foreground/70" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}

                        <div className="border-t border-sidebar-border px-1 py-2">
                            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-[0.2em] text-sidebar-foreground/50">
                                Theme
                            </p>
                            <ThemeModeToggle variant="inline" />
                        </div>

                        <button
                            onClick={async () => {
                                setShowProfileMenu(false);
                                await signoutClient();
                                router.push("/");
                            }}
                            className="w-full flex items-center gap-3 border-t border-sidebar-border px-4 py-3 text-left text-red-300 transition-colors hover:bg-red-500/10"
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
                className="fixed top-4 left-4 z-50 rounded-lg border border-sidebar-border bg-sidebar/95 p-3 shadow-lg md:hidden"
            >
                <FiMenu className="h-6 w-6 text-sidebar-foreground" />
            </motion.button>

            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 72 : 248 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed left-0 top-0 z-40 hidden h-screen bg-sidebar shadow-2xl shadow-black/40 md:block"
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
                            className="fixed left-0 top-0 z-50 h-screen w-[248px] bg-sidebar shadow-2xl shadow-black/40 md:hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 rounded-lg border border-sidebar-border p-2 transition-colors hover:bg-sidebar-accent/40"
                            >
                                <FiX className="h-5 w-5 text-sidebar-foreground/80" />
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
