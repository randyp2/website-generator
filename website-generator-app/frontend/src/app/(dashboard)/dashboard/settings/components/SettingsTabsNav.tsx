"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SettingsTab {
    label: string;
    href: string;
}

const SETTINGS_TABS: readonly SettingsTab[] = [
    { label: "Account", href: "/dashboard/settings/profile" },
    { label: "Billing", href: "/dashboard/settings/billing" },
    { label: "Security", href: "/dashboard/settings/security" },
];

export const SettingsTabsNav = () => {
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);
    const indicatorRef = useRef<HTMLSpanElement>(null);

    // The tabs are separate routes, so a shared layoutId indicator can't
    // animate across the navigation (it unmounts and remounts). Instead we keep
    // ONE persistent underline in the nav (which lives in the settings layout,
    // so it never unmounts) and slide it to the active tab by measuring the
    // active link and transitioning its left/width in CSS.
    useEffect(() => {
        const nav = navRef.current;
        const indicator = indicatorRef.current;
        if (!nav || !indicator) return;

        const measure = () => {
            const active = nav.querySelector<HTMLElement>(
                '[data-active="true"]',
            );
            if (!active) return;
            indicator.style.left = `${active.offsetLeft}px`;
            indicator.style.width = `${active.offsetWidth}px`;
        };

        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [pathname]);

    return (
        <nav
            ref={navRef}
            role="tablist"
            aria-label="Settings sections"
            className="relative flex gap-6 border-b border-border"
        >
            {SETTINGS_TABS.map((tab) => {
                const isActive: boolean =
                    pathname === tab.href ||
                    pathname.startsWith(`${tab.href}/`);

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        role="tab"
                        aria-selected={isActive}
                        data-active={isActive}
                        className={cn(
                            "pb-3 text-sm font-medium transition-colors",
                            isActive
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {tab.label}
                    </Link>
                );
            })}

            {/* Persistent sliding underline. Position is set imperatively above. */}
            <span
                ref={indicatorRef}
                aria-hidden
                className="absolute -bottom-px left-0 h-0.5 w-0 rounded-full bg-primary transition-[left,width] duration-300 ease-out"
            />
        </nav>
    );
};
