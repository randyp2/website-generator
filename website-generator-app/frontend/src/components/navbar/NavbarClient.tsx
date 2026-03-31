"use client";

import { getNavbarItems } from "@/data/navLinks";
import { signoutClient } from "@/lib/logout-client";
import { NavBar } from "@/components/ui/tube-light-navbar";
import { createClient } from "@/utils/supabase/client";
import { Home, Info, LayoutDashboard, Sparkles, User2, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { FiUser } from "react-icons/fi";
import BrandWordmark from "@/components/branding/BrandWordmark";
import type { User } from "@supabase/supabase-js";

const NavbarClient: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const supabase = createClient();
    const navLinks = getNavbarItems(); // Return links to display on navbar
    const pathname = usePathname();
    const activeName =
        navLinks.find((link) => link.link === pathname)?.title ??
        navLinks[0]?.title ??
        "";

    const navItems = useMemo(() => {
        const iconMap: Record<string, LucideIcon> = {
            Home,
            About: Info,
            Explore: LayoutDashboard,
            Features: Sparkles,
            Profile: User2,
            default: Home,
        };
        return navLinks.map((link) => ({
            name: link.title,
            url: link.link,
            icon: iconMap[link.title] ?? iconMap.default,
        }));
    }, [navLinks]);

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

    return (
        <>
            <div className="flex justify-between items-center gap-6 pr-5 w-full">
                {/* Left: Logo + Brand */}
                <Link href="/" className="flex items-center gap-3">
                    <BrandWordmark className="text-2xl text-foreground" />
                </Link>

                {/* Center: Nav links */}
                <div className="flex-1 flex justify-center">
                    {navItems.length > 0 && (
                        <NavBar
                            items={navItems}
                            inline
                            activeName={activeName}
                            className="hidden md:block"
                        />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/dashboard-user")}
                            className="hover:cursor-pointer rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/40"
                        >
                            Continue to Dashboard
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                                await signoutClient(); // Sign out user from client side function since invoked by button and not form
                                router.push("/"); // Redirect to home page
                            }}
                            className="rounded-lg border border-border bg-secondary px-5 py-2.5 font-semibold text-secondary-foreground transition-all hover:bg-muted hover:shadow-md"
                        >
                            Logout
                        </motion.button>
                    </>
                ) : (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/login")}
                            className="hover:cursor-pointer flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-2.5 font-semibold text-secondary-foreground transition-all hover:bg-muted hover:shadow-md"
                        >
                            <FiUser className="w-4 h-4" /> Login
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/dashboard")}
                            className="hover:cursor-pointer w-35 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/40"
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
