"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiMenu, FiX, FiUser } from "react-icons/fi";
import { getNavbarItems } from "../../data/navLinks";
import Link from "next/link";

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Get only items that should show in navbar
    const navLinks = getNavbarItems();

    // Hide navbar on dashboard page (optional)
    const isDashboard = pathname === "/dashboard";

    const handleGetStarted = () => {
        router.push("/dashboard");
        setMobileMenuOpen(false);
    };

    const handleLogin = () => {
        router.push("/login");
        setMobileMenuOpen(false);
    };

    // If on dashboard, show minimal nav
    if (isDashboard) {
        return (
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-sky-300/30">
                                <FiZap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                PortfolioAI
                            </span>
                        </Link>
                        <Link
                            href="/"
                            className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 left-0 right-0 z-50 bg-linear-to-b from-white/90 via-sky-50/80 to-white/70 backdrop-blur-xl border-b border-sky-100/60 shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-sky-300/30">
                            <FiZap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            PortfolioAI
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.id}
                                href={link.link}
                                className={`font-medium transition-colors relative group ${pathname === link.link
                                        ? "text-sky-600"
                                        : "text-slate-600 hover:text-slate-900"
                                    }`}
                            >
                                {link.title}
                                <span
                                    className={`absolute -bottom-1 left-0 h-0.5 bg-sky-400 transition-all duration-300 ${pathname === link.link
                                            ? "w-full"
                                            : "w-0 group-hover:w-full"
                                        }`}
                                />
                            </Link>
                        ))}

                        {/* Login Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogin}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-lg font-semibold border-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                        >
                            <FiUser className="w-4 h-4" />
                            Login
                        </motion.button>

                        {/* Get Started Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGetStarted}
                            className="hover:cursor-pointer px-6 py-2.5 bg-linear-to-r from-sky-400 to-cyan-400 text-white rounded-lg font-semibold shadow-md shadow-sky-300/30 hover:shadow-lg hover:shadow-sky-400/40 transition-all"
                        >
                            Get Started
                        </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <FiX className="w-6 h-6" />
                        ) : (
                            <FiMenu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-200 bg-white"
                    >
                        <div className="px-6 py-4 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.id}
                                    href={link.link}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block py-2 font-medium transition-colors ${pathname === link.link
                                            ? "text-sky-600"
                                            : "text-slate-600 hover:text-slate-900"
                                        }`}
                                >
                                    {link.title}
                                </Link>
                            ))}

                            <button
                                onClick={handleLogin}
                                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-lg font-semibold border-2 border-slate-200"
                            >
                                <FiUser className="w-4 h-4" />
                                Login
                            </button>

                            <button
                                onClick={handleGetStarted}
                                className="w-full px-6 py-2.5 bg-linear-to-r from-sky-400 to-cyan-400 text-white rounded-lg font-semibold shadow-md shadow-sky-300/30"
                            >
                                Get Started
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;