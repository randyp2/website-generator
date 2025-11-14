"use client";

import { getNavbarItems } from "@/data/navLinks";
import { signout } from "@/lib/auth-actions";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiUser, FiZap } from "react-icons/fi";

const NavbarClient: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();
    const navLinks = getNavbarItems(); // Return links to display on navbar
    const pathname = usePathname();

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
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-sky-300/30">
                        <FiZap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        PortfolioAI
                    </span>
                </Link>

                {/* Right: Static Links */}
                <nav role="navigation" aria-label="Main Navigation" className="hidden md:flex gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.id}
                            href={link.link}
                            className={`font-medium relative group transition-colors ${pathname === link.link
                                ? "text-sky-600"
                                : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            {link.title}
                            <span
                                className={`absolute -bottom-1 left-0 h-0.5 bg-sky-400 transition-all duration-300 ${pathname === link.link ? "w-full" : "w-0 group-hover:w-full"
                                    }`}
                            />
                        </Link>
                    ))}
                </nav>
            </div>
            
            <div className="flex items-center gap-4">
                {user ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            signout();
                            setUser(null);
                        }}
                        className="px-5 py-2.5 bg-white text-slate-700 rounded-lg font-semibold border-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                    >
                        Logout
                    </motion.button>
                ) : (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/login")}
                            className="hover:cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-lg font-semibold border-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                        >
                            <FiUser className="w-4 h-4" /> Login
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/dashboard")}
                            className="hover:cursor-pointer w-35 px-6 py-3 bg-linear-to-r from-sky-400 to-cyan-400 text-white rounded-lg font-semibold shadow-md shadow-sky-300/30 hover:shadow-lg hover:shadow-sky-400/40 transition-all"
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