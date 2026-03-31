"use client";

import React from "react";
import { FiEye, FiHeart, FiShare2, FiUserCheck } from "react-icons/fi";

const ANALYTICS_PLACEHOLDER_ITEMS = [
    { label: "Views", value: "3,842", delta: "+12.4%", icon: FiEye },
    { label: "Likes", value: "428", delta: "+8.1%", icon: FiHeart },
    { label: "Shares", value: "94", delta: "+5.3%", icon: FiShare2 },
    { label: "Recruiter Interest", value: "31", delta: "+14.9%", icon: FiUserCheck },
];

const COMMENT_PLACEHOLDERS = [
    {
        id: "c-1",
        author: "A. Kim",
        text: "Love the case study layout and strong project outcomes.",
        time: "2h ago",
    },
    {
        id: "c-2",
        author: "R. Patel",
        text: "Would be great to see a quick demo gif in the hero.",
        time: "5h ago",
    },
    {
        id: "c-3",
        author: "J. Morgan",
        text: "Clean typography and clear story on each section.",
        time: "1d ago",
    },
    {
        id: "c-4",
        author: "S. Lee",
        text: "The hero section feels polished and easy to scan.",
        time: "2d ago",
    },
    {
        id: "c-5",
        author: "N. Rivera",
        text: "Nice balance between visuals and technical detail.",
        time: "4d ago",
    },
];

const RECENT_COMMENT_LIMIT = 5;

const getAuthorInitial = (author: string): string => {
    const firstChar = author.trim().charAt(0);
    return firstChar ? firstChar.toUpperCase() : "?";
};

export const PublishedPortfolioAnalytics: React.FC = () => {
    const recentComments = COMMENT_PLACEHOLDERS.slice(0, RECENT_COMMENT_LIMIT);

    return (
        <section className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
            <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-2xl bg-white/[0.02]">
                {ANALYTICS_PLACEHOLDER_ITEMS.map((item, index) => {
                    const isLeftColumn = index % 2 === 0;
                    const isTopRow = index < 2;

                    return (
                        <div
                            key={item.label}
                            className={[
                                "relative overflow-hidden p-4 md:p-5",
                                !isLeftColumn ? "border-l border-white/10" : "",
                                !isTopRow ? "border-t border-white/10" : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/12 via-transparent to-amber-400/8" />
                            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-400/12 blur-2xl" />
                            <div className="flex items-center justify-between">
                                <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/50">
                                    {item.label}
                                </p>
                                <item.icon className="h-5 w-5 text-orange-200/90 md:h-6 md:w-6" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-white/95 md:text-[1.7rem]">
                                {item.value}
                            </p>
                            <p className="mt-1 text-sm font-medium text-orange-200/90">{item.delta}</p>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-white/10 pt-4">
                <h4 className="text-sm font-semibold text-white">Recent Comments</h4>
                <ul className="mt-2 max-h-[128px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.35)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                    {recentComments.map((comment) => (
                        <li key={comment.id} className="flex items-start gap-2.5 py-1">
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/12 text-[11px] font-semibold text-white/85">
                                {getAuthorInitial(comment.author)}
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-xs font-semibold text-white/85">{comment.author}</p>
                                    <p className="shrink-0 text-[11px] text-white/45">{comment.time}</p>
                                </div>
                                <p className="mt-0.5 text-xs leading-4 text-white/70">{comment.text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};
