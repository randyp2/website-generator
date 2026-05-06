"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SettingsTab {
    label: string;
    href: string;
}

const SETTINGS_TABS: readonly SettingsTab[] = [
    { label: "Profile", href: "/dashboard/settings/profile" },
    { label: "Billing", href: "/dashboard/settings/billing" },
    { label: "Security", href: "/dashboard/settings/security" },
];

export const SettingsTabsNav = () => {
    const pathname = usePathname();

    return (
        <nav
            role="tablist"
            aria-label="Settings sections"
            className="flex gap-6 border-b border-border"
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
                        className={cn(
                            "border-b-2 pb-3 text-sm font-medium transition-colors",
                            isActive
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
};
