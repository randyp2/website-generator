import type { ReactNode } from "react";

interface StepMarkerProps {
    number: number;
    title: string;
    description: string;
    align?: "left" | "right";
    className?: string;
    children?: ReactNode;
}

/**
 * Oversized numeral stacked above the step title and description. The numeral
 * is decorative (aria-hidden) and pushed to the aligned side so it leads into
 * the copy below it.
 */
export const StepMarker = ({
    number,
    title,
    description,
    align = "left",
    className = "",
    children,
}: StepMarkerProps) => {
    const alignRight = align === "right";

    return (
        <div
            className={`flex flex-col gap-2 items-start text-left ${
                alignRight ? "md:items-end md:text-right" : ""
            } ${className}`}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none -mb-1 -mt-1 block select-none bg-gradient-to-br from-primary/40 to-primary/5 bg-clip-text text-[3.5rem] font-black leading-none tracking-tighter text-transparent sm:-mt-2 sm:text-[4.5rem]"
            >
                {number}
            </span>
            <div className="flex min-w-0 flex-col gap-1.5">
                <p className="text-base font-semibold text-foreground sm:text-lg">
                    {title}
                </p>
                <p className="max-w-[28ch] text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
            {children}
        </div>
    );
};
