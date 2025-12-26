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
                    <div className="flex items-center justify-between flex-wrap gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2">
                                Welcome back , {username}!
                            </h1>
                            <p className="text-base text-white/70">
                                Lets Customize Your Portfolio
                            </p>
                        </div>

                        {/* Primary CTA */}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push("/dashboard-user/create")}
                            className="group px-6 py-3 bg-linear-to-r from-[#1b2a44] via-[#12375c] to-[#1b2a44] text-white rounded-xl font-semibold shadow-[0_12px_30px_rgba(17,58,106,0.35)] hover:shadow-[0_18px_40px_rgba(17,58,106,0.45)] transition-shadow flex items-center gap-2 hover:cursor-pointer"
                        >
                            <FiPlus className="w-5 h-5" />
                            New Portfolio
                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                
                            </motion.div>
                        </motion.button>
                    </div>
                </motion.div>
    );
}
