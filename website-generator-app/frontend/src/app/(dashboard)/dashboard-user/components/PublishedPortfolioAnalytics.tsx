"use client";

import React from "react";
import { FiEye, FiHeart, FiShare2, FiUserCheck } from "react-icons/fi";

const ANALYTICS_PLACEHOLDER_ITEMS = [
    { label: "Views", value: "3,842", delta: "+12.4%", icon: FiEye },
    { label: "Likes", value: "428", delta: "+8.1%", icon: FiHeart },
    { label: "Shares", value: "94", delta: "+5.3%", icon: FiShare2 },
    { label: "Recruiter Interest", value: "31", delta: "+14.9%", icon: FiUserCheck },
];

export const PublishedPortfolioAnalytics: React.FC = () => {
    return (
        <section className="relative flex h-full flex-1 overflow-hidden rounded-2xl border border-border bg-card/80 p-3 md:p-4">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-400/18 via-orange-200/8 to-transparent dark:from-orange-500/12 dark:via-transparent dark:to-amber-400/8" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.14),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.10),transparent_30%)]" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-400/12" />

            <div className="relative grid min-h-[280px] flex-1 grid-cols-2 grid-rows-2">
                <div className="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-white/10" />
                <div className="pointer-events-none absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-white/10" />
                {ANALYTICS_PLACEHOLDER_ITEMS.map((item) => {
                    return (
                        <div
                            key={item.label}
                            className="group relative flex h-full flex-col gap-5 p-4 md:p-5"
                        >
                            <div className="relative flex items-start justify-between gap-3">
                                <p className="max-w-[8rem] text-[11px] font-semibold uppercase tracking-[0.22em] text-white/58 md:text-[12px]">
                                    {item.label}
                                </p>
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/10 backdrop-blur-sm">
                                    <item.icon className="h-5 w-5 text-white/75 md:h-[22px] md:w-[22px]" />
                                </span>
                            </div>

                            <div className="relative mt-auto">
                                <p className="text-[2.1rem] font-semibold leading-none tracking-[-0.04em] text-foreground md:text-[2.5rem]">
                                    {item.value}
                                </p>
                                <p className="mt-2 text-base font-semibold text-emerald-300/95">
                                    {item.delta}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
