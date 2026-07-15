import type { ReactNode } from "react";

interface StepMarkerProps {
    number: number;
    title: string;
    description: string;
    align?: "left" | "right";
    children?: ReactNode;
}

/**
 * Oversized ghost numeral with the step copy layered on top. The numeral is
 * decorative (aria-hidden) and shares a single grid cell with the text so the
 * two overlap without absolute positioning, keeping the layout responsive.
 */
export const StepMarker = ({
    number,
    title,
    description,
    align = "left",
    children,
}: StepMarkerProps) => {
    const alignRight = align === "right";

    return (
        <div
            className={`relative grid ${
                alignRight
                    ? "justify-items-end text-right"
                    : "justify-items-start text-left"
            }`}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 select-none self-center bg-gradient-to-br from-primary/40 to-primary/5 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent sm:text-[7.5rem]"
            >
                {number}
            </span>
            <div
                className={`col-start-1 row-start-1 z-10 flex min-w-0 flex-col justify-center gap-1.5 py-2 ${
                    alignRight ? "items-end pr-3" : "items-start pl-3"
                }`}
            >
                <p className="text-base font-semibold text-foreground sm:text-lg">
                    {title}
                </p>
                <p className="max-w-[28ch] text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
                {children}
            </div>
        </div>
    );
};
