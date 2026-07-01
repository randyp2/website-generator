"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import React from "react";
import { useUser } from "@/context/UserContext";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/80 p-5 shadow-lg md:p-6">
                <div>
                    <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
                        Welcome back, {username}!
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Let&apos;s customize your portfolio
                    </p>
                </div>

                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/dashboard/create")}
                    className={cn(
                        buttonVariants({ size: "lg" }),
                        "group gap-2 shadow-lg shadow-primary/30",
                    )}
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
