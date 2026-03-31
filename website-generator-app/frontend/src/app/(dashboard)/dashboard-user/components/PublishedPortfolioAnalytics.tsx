"use client";

import React from "react";

type PublishedPortfolioAnalyticsProps = {
    portfolioTitle: string;
};

const ANALYTICS_PLACEHOLDER_ITEMS = [
    { label: "Total views", value: "—" },
    { label: "Unique visitors", value: "—" },
    { label: "Likes", value: "—" },
    { label: "Comments", value: "—" },
    { label: "Recruiter interest", value: "—" },
    { label: "Click-throughs", value: "—" },
];

export const PublishedPortfolioAnalytics: React.FC<PublishedPortfolioAnalyticsProps> = ({
    portfolioTitle,
}) => {
    return (
        <section className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
            <p className="mb-4 truncate text-xs text-white/55">
                Placeholder metrics for {portfolioTitle}
            </p>

            <div className="grid grid-cols-2 gap-3">
                {ANALYTICS_PLACEHOLDER_ITEMS.map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[11px] uppercase tracking-wide text-white/45">{item.label}</p>
                        <p className="mt-1 text-lg font-semibold text-white/90">{item.value}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
