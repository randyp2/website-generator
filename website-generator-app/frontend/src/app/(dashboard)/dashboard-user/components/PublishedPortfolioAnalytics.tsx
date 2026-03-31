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
];

const getAuthorInitial = (author: string): string => {
    const firstChar = author.trim().charAt(0);
    return firstChar ? firstChar.toUpperCase() : "?";
};

export const PublishedPortfolioAnalytics: React.FC = () => {
    return (
        <section className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
            <div className="mb-5 grid grid-cols-2 gap-3">
                {ANALYTICS_PLACEHOLDER_ITEMS.map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] uppercase tracking-wide text-white/45">{item.label}</p>
                            <item.icon className="h-3.5 w-3.5 text-white/65" />
                        </div>
                        <p className="mt-1 text-lg font-semibold text-white/90">{item.value}</p>
                        <p className="mt-0.5 text-xs font-medium text-emerald-300/90">{item.delta}</p>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/10 pt-4">
                <h4 className="text-sm font-semibold text-white">Recent Comments</h4>
                <ul className="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.35)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                    {COMMENT_PLACEHOLDERS.map((comment) => (
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
