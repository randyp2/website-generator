"use client";

import type { ButtonHTMLAttributes, ReactElement } from "react";
import React from "react";

type GradientStopSet = {
    from: string;
    via: string;
    to: string;
};

type GlassCtaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: ReactElement<{ className?: string }>;
    title: string;
    subtitle?: string;
    size?: "sm" | "md" | "lg";
    gradientLight?: GradientStopSet;
    gradientDark?: GradientStopSet;
};

const sizeClasses: Record<NonNullable<GlassCtaButtonProps["size"]>, string> = {
    sm: "p-3 rounded-xl",
    md: "px-4 py-3 rounded-2xl",
    lg: "p-6 rounded-3xl",
};

export const GlassCtaButton = ({
    icon,
    title,
    subtitle,
    size = "md",
    gradientLight = {
        from: "from-orange-500/40",
        via: "via-amber-400/40",
        to: "to-orange-600/60",
    },
    gradientDark = {
        from: "from-orange-900/35",
        via: "via-black/50",
        to: "to-black/70",
    },
    className,
    ...props
}: GlassCtaButtonProps) => (
    <button
        {...props}
        className={`group relative overflow-hidden border-2 cursor-pointer transition-all duration-500 ease-out
                  shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.02] hover:-translate-y-1 active:scale-95
                  ${sizeClasses[size]}
                  border-orange-500/40 bg-gradient-to-br ${gradientLight.from} ${gradientLight.via} ${gradientLight.to}
                  dark:${gradientDark.from} dark:${gradientDark.via} dark:${gradientDark.to} ${className ?? ""}`}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/35 to-transparent -translate-x-full transition-transform duration-1000 ease-out group-hover:translate-x-full" />

        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/20 via-amber-300/10 to-orange-500/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative z-10 flex items-center gap-4">
            {React.cloneElement(icon, {
                className:
                    "h-6 w-6 text-white transition-all duration-300 group-hover:scale-110 group-hover:text-white/90 drop-shadow-lg",
            })}

            <div className="flex-1 text-left">
                <p className="text-lg font-bold text-white drop-shadow-sm transition-colors duration-300 group-hover:text-white/90">
                    {title}
                </p>
                {subtitle ? (
                    <p className="text-sm text-white/70 transition-colors duration-300 group-hover:text-white/90">
                        {subtitle}
                    </p>
                ) : null}
            </div>

            <div className="opacity-40 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                <svg
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    fill="none"
                    className="h-5 w-5 text-white"
                >
                    <path
                        d="M9 5l7 7-7 7"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        </div>
    </button>
);
