"use client";

import React, { useState } from "react";
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
    FiCheck,
    FiX,
    FiLogOut,
    FiUser,
    FiMoreHorizontal,
    FiShield,
    FiArrowUpRight,
} from "react-icons/fi";
import { FaUsers } from "react-icons/fa";
import { MdOutlineCreate } from "react-icons/md";
import { IconType } from "react-icons";
import { useTheme } from "next-themes";
import { signoutClient } from "@/lib/logout-client";
import { useUser } from "@/context/UserContext";
import BrandWordmark from "@/components/branding/BrandWordmark";
import useMyProfilePath from "@/hooks/useMyProfilePath";
import { usePortfolioListQuery } from "../dashboard/hooks/usePortfolioListQuery";
import { useGenerationJobStore } from "@/stores/useGenerationJobStore";

interface NavItem {
    id: string;
    label: string;
    icon: IconType;
    path: string;
    badge?: string | number;
    /** Links out of the dashboard shell (e.g. the public site); shows an outbound arrow. */
    external?: boolean;
    /** Renders a separator above this item. */
    dividerBefore?: boolean;
    /** Shows a spinner on the item while related background work runs. */
    busy?: boolean;
}

/** Minimal orange ring spinner shown while a portfolio job is running. */
const GenerationSpinner: React.FC<{ className?: string }> = ({
    className = "",
}) => (
    <span
        role="status"
        aria-label="Portfolio generating"
        className={`inline-block shrink-0 animate-spin rounded-full border-2 border-orange-500/25 border-t-orange-500 ${className}`}
    />
);

interface SidebarNavigationProps {
    collapsed?: boolean;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
    collapsed: externalCollapsed,
    mobileOpen,
    setMobileOpen,
}) => {
    const { user } = useUser(); // Extract user from context

    // Extract user info
    const { username } = user;
    const { email } = user;
    const { avatar } = user;

    const pathname = usePathname();
    const router = useRouter();
    const { profilePath } = useMyProfilePath(true);
    const { theme, setTheme } = useTheme();
    const { data: portfolios = [] } = usePortfolioListQuery(user?.id);
    const portfoliosCount = portfolios.length;
    const activeJob = useGenerationJobStore((state) => state.activeJob);
    const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
    const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
    const currentTheme =
        theme === "light" || theme === "dark" || theme === "system"
            ? theme
            : "system";

    const collapsed = externalCollapsed ?? false;

    const navItems: NavItem[] = [
        {
            id: "home",
            label: "Dashboard",
            icon: FiGrid,
            path: "/dashboard",
        },
        {
            id: "portfolios",
            label: "My Portfolios",
            icon: FiFolder,
            path: "/dashboard/portfolios",
            badge: portfoliosCount,
        },
        {
            id: "create",
            label: "Create New",
            icon: MdOutlineCreate,
            path: "/dashboard/create",
            busy: activeJob !== null,
        },
        {
            id: "publish",
            label: "Publish",
            icon: FiShare2,
            path: "/dashboard/publish",
        },
        {
            id: "verification",
            label: "Verification",
            icon: FiShield,
            path: "/dashboard/verification",
        },
        {
            id: "explore",
            label: "Explore",
            icon: FaUsers,
            path: "/explore",
            external: true,
            dividerBefore: true,
        },
        {
            id: "profile",
            label: "Profile",
            icon: FiUser,
            path: profilePath ?? "/dashboard",
            external: true,
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
                    className={`hover:cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-md group relative ${
                        isActive
                            ? "bg-sidebar-primary text-primary-foreground"
                            : "text-sidebar-foreground/85 hover:bg-sidebar-primary/25 hover:text-primary"
                    }`}
                >
                    <div
                        className={`flex items-center justify-center ${
                            collapsed ? "w-full" : ""
                        }`}
                    >
                        <Icon
                            className={`h-[18px] w-[18px] transition-all duration-200 ${
                                isActive
                                    ? "text-primary-foreground"
                                    : "text-sidebar-foreground/80 group-hover:text-primary"
                            }`}
                        />
                    </div>

                    {collapsed && item.busy && (
                        <GenerationSpinner className="absolute right-1 top-1 h-2.5 w-2.5" />
                    )}

                    {!collapsed && (
                        <>
                            <span
                                className={`relative z-10 flex-1 text-[13px] font-medium transition-all duration-200 ${
                                    isActive
                                        ? "text-primary-foreground"
                                        : "text-sidebar-foreground/85 group-hover:text-primary"
                                }`}
                            >
                                {item.label}
                            </span>

                            {item.busy && (
                                <GenerationSpinner className="h-3.5 w-3.5" />
                            )}

                            {item.badge && (
                                <span className="text-sm font-bold tabular-nums text-orange-400 transition-all duration-200">
                                    {item.badge}
                                </span>
                            )}

                            {item.external && (
                                <FiArrowUpRight className="h-3.5 w-3.5 text-sidebar-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                            )}
                        </>
                    )}
                </motion.div>
            </Link>
        );
    };

    const renderSidebarContent = () => (
        <div className="flex h-full flex-col [&_button:hover]:cursor-pointer">
            {/* Logo / Brand */}
            <div
                className={`border-b border-sidebar-border ${collapsed ? "px-3 py-3.5" : "px-5 pt-4 pb-3.5"}`}
            >
                <div className={`flex ${collapsed ? "justify-center" : "px-3"}`}>
                    <Link href="/">
                        {collapsed ? (
                            <BrandWordmark
                                compact
                                className="text-xs text-sidebar-foreground"
                            />
                        ) : (
                            <BrandWordmark className="text-sm text-sidebar-foreground" />
                        )}
                    </Link>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1.5">
                {navItems.map((item) => (
                    <React.Fragment key={item.id}>
                        {item.dividerBefore && (
                            <div className="my-2 border-t border-sidebar-border/60" />
                        )}
                        <NavItemComponent item={item} />
                    </React.Fragment>
                ))}
            </div>

            {/* Profile Menu */}
            <div className="relative border-t border-sidebar-border p-3.5">
                {collapsed ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        onClick={() => {
                            setShowProfileMenu((prev) => {
                                const next = !prev;
                                if (!next) setShowThemeModal(false);
                                return next;
                            });
                        }}
                        className="hover:cursor-pointer mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent/20"
                        aria-expanded={showProfileMenu}
                        aria-label="Open account menu"
                    >
                        {avatar ? (
                            <Image
                                src={avatar}
                                alt="User Avatar"
                                width={32}
                                height={32}
                                unoptimized
                                className="h-7 w-7 rounded-full border border-sidebar-border object-cover"
                            />
                        ) : (
                            <FiUser className="h-4 w-4 text-sidebar-foreground/70" />
                        )}
                    </motion.button>
                ) : (
                    <div className="w-full flex items-center gap-2.5 px-1 py-1 transition-colors hover:text-primary">
                        {avatar ? (
                            <Image
                                src={avatar}
                                alt="User Avatar"
                                width={32}
                                height={32}
                                unoptimized
                                className="h-7 w-7 rounded-full border border-sidebar-border object-cover"
                            />
                        ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent/30">
                                <FiUser className="h-4 w-4 text-sidebar-foreground/70" />
                            </div>
                        )}

                        <div className="min-w-0 flex-1 text-left">
                            <p className="truncate text-[13px] font-medium text-sidebar-foreground">
                                {username || "Account"}
                            </p>
                            <p className="truncate text-[11px] text-sidebar-foreground/70">
                                {email}
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            onClick={() => {
                                setShowProfileMenu((prev) => {
                                    const next = !prev;
                                    if (!next) setShowThemeModal(false);
                                    return next;
                                });
                            }}
                            className="hover:cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/40 hover:text-primary"
                            aria-expanded={showProfileMenu}
                            aria-label="Open account menu"
                        >
                            <FiMoreHorizontal className="h-4 w-4" />
                        </motion.button>
                    </div>
                )}

                {showProfileMenu && (
                    <div
                        className={`absolute z-50 overflow-visible rounded-xl border border-border bg-card shadow-2xl ${
                            mobileOpen
                                ? "bottom-full left-0 mb-2 w-full"
                                : collapsed
                                  ? "bottom-2 left-full ml-2 w-72"
                                  : "bottom-2 left-full ml-3 w-72"
                        }`}
                    >
                        {[
                            { icon: FiSettings, label: "Settings", path: "/dashboard/settings/profile" },
                            { icon: FiShare2, label: "Pricing", path: "/pricing" },
                            { icon: FiHelpCircle, label: "Help" },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    setShowThemeModal(false);
                                    if ("path" in item && item.path) {
                                        router.push(item.path);
                                    }
                                }}
                                className="group hover:cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-left text-card-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                            >
                                <item.icon className="h-4 w-4 text-card-foreground/70 transition-colors group-hover:text-primary" />
                                <span className="text-[13px]">{item.label}</span>
                            </button>
                        ))}

                        <div className="relative border-t border-sidebar-border">
                            <button
                                onClick={() => setShowThemeModal((prev) => !prev)}
                                className="group hover:cursor-pointer flex w-full items-center gap-3 px-4 py-2.5 text-left text-card-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                            >
                                <FiSettings className="h-4 w-4 text-card-foreground/70 transition-colors group-hover:text-primary" />
                                <span className="text-[13px]">Theme</span>
                                <span className="ml-auto text-[11px] uppercase tracking-wide text-card-foreground/55 group-hover:text-primary/80">
                                    {currentTheme}
                                </span>
                            </button>

                            <AnimatePresence>
                                {showThemeModal && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                                        className={`absolute z-[70] overflow-hidden rounded-xl border border-border bg-card shadow-2xl ${
                                            mobileOpen
                                                ? "bottom-full left-0 mb-2 w-full"
                                                : "bottom-2 left-full ml-2 w-56"
                                        }`}
                                    >
                                        <div className="border-b border-sidebar-border px-4 py-3">
                                            <p className="text-sm font-semibold text-card-foreground">Theme</p>
                                        </div>

                                        {([
                                            { value: "light", label: "Light Theme" },
                                            { value: "dark", label: "Dark Theme" },
                                            { value: "system", label: "System" },
                                        ] as const).map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setTheme(option.value);
                                                    setShowThemeModal(false);
                                                    setShowProfileMenu(false);
                                                }}
                                                className="group hover:cursor-pointer flex w-full items-center gap-3 px-4 py-3 text-left text-card-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                                            >
                                                <span className="text-[13px]">{option.label}</span>
                                                {currentTheme === option.value ? (
                                                    <FiCheck className="ml-auto h-4 w-4 text-primary" />
                                                ) : null}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={async () => {
                                setShowProfileMenu(false);
                                setShowThemeModal(false);
                                await signoutClient();
                                router.push("/");
                            }}
                            className="hover:cursor-pointer w-full flex items-center gap-3 border-t border-sidebar-border px-4 py-2.5 text-left text-red-300 transition-colors hover:bg-red-500/10"
                        >
                            <FiLogOut className="h-4 w-4" />
                            <span className="text-[13px]">Sign Out</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 72 : 248 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed left-0 top-0 z-40 hidden h-screen bg-sidebar shadow-2xl shadow-black/40 md:block"
            >
                {renderSidebarContent()}
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
                            className="absolute top-4 right-4 rounded-lg border border-sidebar-border p-2 transition-colors hover:cursor-pointer hover:bg-sidebar-accent/40"
                        >
                                <FiX className="h-5 w-5 text-sidebar-foreground/80" />
                            </button>

                            {renderSidebarContent()}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default SidebarNavigation;
