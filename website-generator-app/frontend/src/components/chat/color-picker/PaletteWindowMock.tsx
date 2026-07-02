"use client";

import { cn } from "@/lib/utils";
import type { PaletteColors } from "./types";

interface PaletteWindowMockProps {
    colors: PaletteColors;
    className?: string;
}

/**
 * Miniature website wireframe painted with a palette: a top navbar on the
 * secondary color with a primary logo dot, muted nav links, and a primary
 * CTA, above a content pane on the background color with text/muted copy
 * lines and an accent content block.
 *
 * Rendered with spans only so it can live inside interactive elements such
 * as PaletteThemeCard's button.
 */
export const PaletteWindowMock = ({
    colors,
    className,
}: PaletteWindowMockProps) => (
    <span
        className={cn(
            "flex w-full flex-col overflow-hidden rounded-t-lg border border-b-0 border-black/25 shadow-xl shadow-black/20",
            className,
        )}
        style={{ backgroundColor: colors.background }}
    >
        {/* Navbar */}
        <span
            className="flex shrink-0 items-center gap-1.5 px-2.5 py-2"
            style={{ backgroundColor: colors.secondary }}
        >
            <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colors.primary }}
            />
            <span
                className="h-1.5 w-8 rounded-sm"
                style={{ backgroundColor: colors.text }}
            />
            <span className="ml-auto flex items-center gap-1.5">
                <span
                    className="h-1.5 w-5 rounded-sm opacity-80"
                    style={{ backgroundColor: colors.muted }}
                />
                <span
                    className="h-1.5 w-5 rounded-sm opacity-80"
                    style={{ backgroundColor: colors.muted }}
                />
                <span
                    className="h-1.5 w-5 rounded-sm opacity-80"
                    style={{ backgroundColor: colors.muted }}
                />
                <span
                    className="h-3.5 w-8 rounded"
                    style={{ backgroundColor: colors.primary }}
                />
            </span>
        </span>

        {/* Content pane */}
        <span className="flex min-h-0 flex-1 flex-col gap-1.5 p-2.5">
            <span className="flex items-center gap-1.5">
                <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                />
                <span className="flex min-w-0 flex-col gap-1">
                    <span
                        className="h-1.5 w-14 rounded-sm"
                        style={{ backgroundColor: colors.text }}
                    />
                    <span
                        className="h-1 w-20 rounded-sm"
                        style={{ backgroundColor: colors.muted }}
                    />
                </span>
            </span>
            <span
                className="block h-1 w-full rounded-sm opacity-80"
                style={{ backgroundColor: colors.muted }}
            />
            <span
                className="block h-1 w-5/6 rounded-sm opacity-80"
                style={{ backgroundColor: colors.muted }}
            />
            <span
                className="block min-h-12 w-full flex-1 rounded-md"
                style={{ backgroundColor: colors.accent }}
            />
        </span>
    </span>
);
