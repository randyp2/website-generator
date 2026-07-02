"use client";

import { HexColorPicker } from "react-colorful";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorSwatchFieldProps {
    color: string;
    label: string;
    onColorChange: (color: string) => void;
}

/**
 * Inline color role row: swatch, label, hex value. Clicking the swatch opens
 * a popover color wheel (react-colorful); the hex value can also be typed
 * directly in the input. Styling follows the app's light/dark theme.
 */
export const ColorSwatchField = ({
    color,
    label,
    onColorChange,
}: ColorSwatchFieldProps) => (
    <div className="flex items-center gap-3 py-1.5">
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={`Pick ${label} color`}
                    className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-neutral-300 transition hover:scale-110 focus-visible:border-primary focus-visible:outline-none dark:border-white/20"
                    style={{ backgroundColor: color }}
                />
            </PopoverTrigger>
            <PopoverContent
                side="bottom"
                align="start"
                className="w-auto rounded-2xl p-3"
            >
                <HexColorPicker color={color} onChange={onColorChange} />
            </PopoverContent>
        </Popover>
        <span className="flex-1 truncate text-sm font-medium text-neutral-900 dark:text-white">
            {label}
        </span>
        <input
            type="text"
            value={color}
            onChange={(event) => onColorChange(event.target.value)}
            aria-label={`${label} hex value`}
            className={cn(
                "h-8 w-24 rounded-md bg-transparent px-2 text-right font-mono text-xs uppercase tracking-[0.08em] outline-none transition",
                "text-neutral-600 focus:bg-neutral-200/60 focus:text-neutral-950 dark:text-white/80 dark:focus:bg-white/10 dark:focus:text-white",
            )}
        />
    </div>
);
