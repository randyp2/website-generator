"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

import {
    FiPlus,
    FiFolder,
    FiDownload,
    FiGlobe,
    FiTrendingUp,
    FiZap,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

/**
 * MODULE 1: DASHBOARD HOME / OVERVIEW
 * 
 * Design Goals:
 * - Warm welcome that makes users feel at home
 * - Quick-glance stats show portfolio ecosystem health
 * - Primary CTA (New Portfolio) is unmissable
 * - Background motion adds life without distraction
 * - Clear visual hierarchy: Welcome → Stats → Action
 */

const DashboardHome: React.FC = () => {
    const router = useRouter();

    // Mock data - replace with real user stats
    const stats = [
        {
            label: "Portfolios",
            value: "12",
            icon: <FiFolder className="w-5 h-5" />,
            color: "sky",
            change: "+3 this month",
        },
        {
            label: "Total Views",
            value: "2.4K",
            icon: <FiTrendingUp className="w-5 h-5" />,
            color: "teal",
            change: "+14% vs last month",
        },
        {
            label: "Exports",
            value: "8",
            icon: <FiDownload className="w-5 h-5" />,
            color: "cyan",
            change: "Last export 2 days ago",
        },
        {
            label: "Deployed",
            value: "5",
            icon: <FiGlobe className="w-5 h-5" />,
            color: "violet",
            change: "3 active live sites",
        },
    ];

    

    return (
        <div className="relative">
           

            {/* Content */}
            <div className="relative z-10 space-y-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                                Welcome back
                            </h1>
                            <p className="text-lg text-slate-600">
                                Lets Customize Your Portfolio
                            </p>
                        </div>

                        {/* Primary CTA */}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push("/dashboard/create")}
                            className="group px-6 py-4 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold shadow-xl shadow-sky-400/30 hover:shadow-2xl hover:shadow-sky-500/40 transition-all flex items-center gap-2 hover:cursor-pointer"
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="relative group"
                        >
                            {/* Glass Card */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all">
                                {/* Icon Badge */}
                                <div
                                    className={`w-12 h-12 rounded-xl bg-linear-to-br from-${stat.color}-100 to-${stat.color}-200 flex items-center justify-center text-${stat.color}-600 mb-4 group-hover:scale-110 transition-transform`}
                                >
                                    {stat.icon}
                                </div>

                                {/* Stat Value */}
                                <div className="mb-2">
                                    <div className="text-3xl font-bold text-slate-900">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm font-medium text-slate-600">
                                        {stat.label}
                                    </div>
                                </div>

                                {/* Change Indicator */}
                                <div className="text-xs text-slate-500">{stat.change}</div>

                                {/* Hover Glow Effect */}
                                <div
                                    className={`absolute inset-0 rounded-2xl bg-linear-to-r from-${stat.color}-400/0 to-${stat.color}-400/0 group-hover:from-${stat.color}-400/5 group-hover:to-${stat.color}-400/10 transition-all pointer-events-none`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                title: "Browse Templates",
                                desc: "Start from a beautiful preset",
                                action: () => router.push("/dashboard-user/create"),
                            },
                            {
                                title: "View Portfolios",
                                desc: "Manage your creations",
                                action: () => router.push("/dashboard-user/portfolios"),
                            },
                            {
                                title: "Customize Theme",
                                desc: "Make it uniquely yours",
                                action: () => router.push("/dashboard-user/theme"),
                            },
                        ].map((action, i) => (
                            <motion.button
                                key={action.title}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={action.action}
                                className="text-left p-6 rounded-xl border-2 border-slate-200 hover:cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition-all group"
                            >
                                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-sky-600 transition-colors">
                                    {action.title}
                                </h3>
                                <p className="text-sm text-slate-600">{action.desc}</p>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardHome;
