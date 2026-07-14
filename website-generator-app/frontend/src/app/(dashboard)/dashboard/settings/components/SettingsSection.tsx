import type { LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Accepts both lucide icons and react-icons (brand marks). */
type IconComponent = ComponentType<{ className?: string }>;

interface SettingsSectionProps {
    icon: LucideIcon;
    /** Tailwind classes for the icon chip (background + text color). */
    iconClassName?: string;
    title: string;
    description?: string;
    /** Applied to the content container (e.g. `divide-y` for row lists). */
    className?: string;
    /** Tone for the title text; danger renders it red. */
    tone?: "default" | "danger";
    children: ReactNode;
}

/**
 * A settings section: an icon-led header over a single softly rounded
 * container. Sections are separated by spacing rather than nested boxes.
 */
export const SettingsSection = ({
    icon: Icon,
    iconClassName,
    title,
    description,
    className,
    tone = "default",
    children,
}: SettingsSectionProps) => (
    <section className="space-y-4">
        <div className="flex items-start gap-3">
            <span
                className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                    iconClassName ?? "bg-muted text-muted-foreground",
                )}
            >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 pt-0.5">
                <h2
                    className={cn(
                        "text-sm font-semibold tracking-tight",
                        tone === "danger"
                            ? "text-red-600 dark:text-red-400"
                            : "text-foreground",
                    )}
                >
                    {title}
                </h2>
                {description ? (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
        </div>
        <div
            className={cn(
                "overflow-hidden rounded-2xl border bg-card/40",
                tone === "danger"
                    ? "border-red-500/25 bg-red-500/[0.04]"
                    : "border-border/60",
                className,
            )}
        >
            {children}
        </div>
    </section>
);

interface SettingsRowProps {
    title: string;
    description?: string;
    /** Optional leading icon rendered in a small muted chip. */
    icon?: IconComponent;
    iconClassName?: string;
    children?: ReactNode;
    className?: string;
}

/** A single row inside a settings section: label left, control right. */
export const SettingsRow = ({
    title,
    description,
    icon: Icon,
    iconClassName,
    children,
    className,
}: SettingsRowProps) => (
    <div
        className={cn(
            "flex flex-col gap-2 px-4 py-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-6",
            className,
        )}
    >
        <div className="flex min-w-0 items-center gap-3">
            {Icon ? (
                <span
                    className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                        iconClassName ?? "bg-muted text-muted-foreground",
                    )}
                >
                    <Icon className="h-4 w-4" />
                </span>
            ) : null}
            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{title}</p>
                {description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
        </div>
        {children ? (
            <div className="flex shrink-0 items-center gap-2.5 pl-11 sm:pl-0">
                {children}
            </div>
        ) : null}
    </div>
);
