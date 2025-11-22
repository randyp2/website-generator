"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiPlus, FiZap } from "react-icons/fi";
import React from "react";
import { useUser } from "@/context/UserContext";

export const WelcomeSection: React.FC = () => {

    const router = useRouter();
    
    // Get user using useContext
    const { user } = useUser();

    // Extract username
    const { username } = user;

    return (
        <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                                Welcome back , {username}!
                            </h1>
                            <p className="text-lg text-slate-600">
                                Lets Customize Your Portfolio
                            </p>
                        </div>

                        {/* Primary CTA */}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push("/dashboard-user/create")}
                            className="group px-6 py-4 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold shadow-xl shadow-sky-400/30 hover:shadow-2xl hover:shadow-sky-500/40 transition-shadow flex items-center gap-2 hover:cursor-pointer"
                        >
                            <FiPlus className="w-5 h-5" />
                            New Portfolio
                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <FiZap className="w-4 h-4" />
                            </motion.div>
                        </motion.button>
                    </div>
                </motion.div>
    );
}