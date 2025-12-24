"use client";

import { getNavbarItems } from "@/data/navLinks";
import { signoutClient } from "@/lib/logout-client";
import { NavBar } from "@/components/ui/tube-light-navbar";
import { createClient } from "@/utils/supabase/client";
import { Home, Info, LayoutDashboard, Sparkles, User2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { FiUser } from "react-icons/fi";

const NavbarClient: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();
    const navLinks = getNavbarItems(); // Return links to display on navbar
    const pathname = usePathname();
    const activeName =
        navLinks.find((link) => link.link === pathname)?.title ??
        navLinks[0]?.title ??
        "";

    const navItems = useMemo(() => {
        const iconMap: Record<string, any> = {
            Home,
            About: Info,
            Examples: LayoutDashboard,
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
                    <span className="text-2xl font-bold text-white">
                        PortfolioAI
                    </span>
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
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                            await signoutClient(); // Sign out user from client side function since invoked by button and not form
                            router.push("/"); // Redirect to home page
                        }}
                            className="px-5 py-2.5 bg-white text-slate-900 rounded-lg font-semibold border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                    >
                        Logout
                    </motion.button>
                ) : (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/login")}
                            className="hover:cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-lg font-semibold border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                        >
                            <FiUser className="w-4 h-4" /> Login
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/dashboard")}
                            className="hover:cursor-pointer w-35 px-6 py-3 bg-linear-to-r from-cyan-500 via-sky-500 to-cyan-400 text-white rounded-lg font-semibold shadow-md shadow-cyan-400/30 hover:shadow-lg hover:shadow-cyan-400/50 transition-all"
                        >
                            Get Started
                        </motion.button>
                    </>
                )}
            </div>
        </>
    );

}

export default NavbarClient;
