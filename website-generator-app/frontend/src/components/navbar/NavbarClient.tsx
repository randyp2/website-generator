"use client";

import { getNavbarItems } from "@/data/navLinks";
import { signoutClient } from "@/lib/logout-client";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FiLogOut, FiLayout, FiUser } from "react-icons/fi";
import BrandWordmark from "@/components/branding/BrandWordmark";
import type { User } from "@supabase/supabase-js";
import ThemeToggle from "@/components/theme/ThemeToggle";

const NavbarClient: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const navLinks = getNavbarItems(); // Return links to display on navbar
    const pathname = usePathname();
    const profileMenuRef = useRef<HTMLDivElement | null>(null);

    /* ---------- SESSION MANAGEMENT ---------- */
    /**
     * Effect to initialize user session and listen for auth state changes
     * - On mount, tries to restore session from local storage
     * - Sets up listener for login/logout events to update user state
     * - Cleans up listener on unmount
     */
    useEffect(() => {
        // Try to restore the user session immediately
        const initUser = async () => {
            // Get data from session based on the browsers local storage
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setUser(session?.user ?? null); // Set the user if there is one
        };

        initUser();

        // Listen for any changes (login/logout) and update automatically
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Cleanup listener on unmount
        return () => subscription.unsubscribe();
    }, [supabase]);

    useEffect(() => {
        if (!showProfileMenu) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)
            ) {
                setShowProfileMenu(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [showProfileMenu]);

    const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
    const displayName =
        (user?.user_metadata?.full_name as string | undefined) ??
        (user?.user_metadata?.name as string | undefined) ??
        (user?.email ? user.email.split("@")[0] : "Account");
    const avatarInitial = displayName.charAt(0).toUpperCase();

    return (
        <>
            <div className="flex justify-between items-center gap-6 pr-5 w-full">
                {/* Left: Logo + Brand */}
                <Link href="/" className="flex items-center gap-3">
                    <BrandWordmark className="text-2xl text-foreground" />
                </Link>

                {/* Center: Nav links */}
                <nav
                    role="navigation"
                    aria-label="Main Navigation"
                    className="hidden md:flex gap-6"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.id}
                            href={link.link}
                            className={`group relative font-medium transition-colors ${
                                pathname === link.link
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {link.title}
                            <span
                                className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                                    pathname === link.link
                                        ? "w-full"
                                        : "w-0 group-hover:w-full"
                                }`}
                            />
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                {user ? (
                    <div className="relative" ref={profileMenuRef}>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowProfileMenu((open) => !open)}
                            className="hover:cursor-pointer flex items-center gap-2"
                            aria-haspopup="menu"
                            aria-expanded={showProfileMenu}
                            aria-label="Open account menu"
                        >
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={`${displayName} profile`}
                                    className="size-7 min-h-7 min-w-7 max-h-7 max-w-7 shrink-0 rounded-full object-cover aspect-square"
                                />
                            ) : (
                                <div className="flex size-7 min-h-7 min-w-7 max-h-7 max-w-7 shrink-0 items-center justify-center rounded-full bg-primary/18 text-xs font-semibold text-foreground aspect-square">
                                    {avatarInitial}
                                </div>
                            )}
                        </motion.button>

                        {showProfileMenu && (
                            <div className="absolute right-0 top-full z-50 mt-3 min-w-60 overflow-hidden rounded-2xl border border-border bg-card/95 p-2 text-card-foreground shadow-2xl shadow-black/30 backdrop-blur-xl">
                                <div className="border-b border-border px-3 py-3">
                                    <p className="truncate text-sm font-semibold text-card-foreground">
                                        {displayName}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        router.push("/dashboard-user");
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors hover:cursor-pointer hover:bg-muted/70"
                                >
                                    <FiLayout className="h-4 w-4 text-muted-foreground" />
                                    <span>Continue to Dashboard</span>
                                </button>

                                <button
                                    onClick={async () => {
                                        setShowProfileMenu(false);
                                        await signoutClient();
                                        router.push("/");
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-300 transition-colors hover:cursor-pointer hover:bg-red-500/10"
                                >
                                    <FiLogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/login")}
                            className="hover:cursor-pointer flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 font-semibold text-card-foreground transition-all hover:bg-muted hover:shadow-md"
                        >
                            <FiUser className="w-4 h-4" /> Login
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/dashboard")}
                            className="hover:cursor-pointer w-35 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/35"
                        >
                            Get Started
                        </motion.button>
                    </>
                )}
            </div>
        </>
    );
};

export default NavbarClient;
