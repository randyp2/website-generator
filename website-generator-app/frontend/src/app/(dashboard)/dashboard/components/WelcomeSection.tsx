"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import React from "react";
import { useUser } from "@/context/UserContext";

export const WelcomeSection: React.FC = () => {
    const router = useRouter();

    const { user } = useUser();
    const { username } = user;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/80 px-6 py-5 shadow-lg">
                <div>
                    <h1 className="mb-2 text-3xl font-semibold text-foreground md:text-4xl">
                        Welcome back , {username}!
                    </h1>
                    <p className="text-base text-muted-foreground">
                        Lets Customize Your Portfolio
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/dashboard/create")}
                    className="group flex cursor-pointer items-center gap-2 rounded-xl border border-primary/40 bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
                >
                    <FiPlus className="h-5 w-5" />
                    New Portfolio
                    <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.button>
            </div>
        </motion.div>
    );
};
