"use client";

import type { JSX } from "react";
import { useEffect, useState } from "react";

const VERIFIED_PERCENT = 78;
const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const VerificationRingCard = (): JSX.Element => {
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        const timer = window.setTimeout(() => setProgress(VERIFIED_PERCENT), 100);

        return () => window.clearTimeout(timer);
    }, []);

    const strokeDashoffset =
        RING_CIRCUMFERENCE - (progress / 100) * RING_CIRCUMFERENCE;

    return (
        <div className="relative">
            <svg className="h-28 w-28 -rotate-90 drop-shadow-[0_0_24px_rgba(245,158,11,0.2)]" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r={RING_RADIUS - 6}
                    fill="var(--card)"
                />
                <circle
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-border"
                />
                <circle
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                    stroke="url(#verification-gradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                />
                <defs>
                    <linearGradient
                        id="verification-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--accent)" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">
                    {progress}%
                </span>
                <span className="text-xs text-muted-foreground">Verified</span>
            </div>
        </div>
    );
};

export default VerificationRingCard;
