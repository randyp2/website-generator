"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FiZap, FiMenu, FiX, FiUser } from "react-icons/fi";
import { getNavbarItems } from "../../data/navLinks";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();
  const navLinks = getNavbarItems();
  const isDashboard = pathname === "/dashboard";

  useEffect(() => {
    // Try to restore the user session immediately
    const initUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      console.log("🧩 Restored session:", session);
      setUser(session?.user ?? null);
    };
  
    initUser();
  
    // Listen for any changes (login/logout) and update automatically
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 Auth state change:", _event, session);
      setUser(session?.user ?? null);
    });
  
    // Cleanup listener on unmount
    return () => subscription.unsubscribe();
  }, [supabase]);
  

  const handleGetStarted = () => {
    router.push("/dashboard");
    setMobileMenuOpen(false);
  };
  const handleLogin = () => {
    router.push("/login");
    setMobileMenuOpen(false);
  };

  // --- existing dashboard-only layout ---
  if (isDashboard) {
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
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
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-sky-300/30">
            <FiZap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            PortfolioAI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.link}
              className={`font-medium relative group transition-colors ${
                pathname === link.link
                  ? "text-sky-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {link.title}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-sky-400 transition-all duration-300 ${
                  pathname === link.link ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}

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
                onClick={handleLogin}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-lg font-semibold border-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <FiUser className="w-4 h-4" />
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-6 py-2.5 bg-linear-to-r from-sky-400 to-cyan-400 text-white rounded-lg font-semibold shadow-md shadow-sky-300/30 hover:shadow-lg hover:shadow-sky-400/40 transition-all"
              >
                Get Started
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
