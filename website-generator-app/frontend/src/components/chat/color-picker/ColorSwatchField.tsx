"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ColorSwatchFieldProps {
    color: string;
    label: string;
    isSelected?: boolean;
    onSelect?: () => void;
    isEditable?: boolean;
    onColorChange?: (color: string) => void;
}

export const ColorSwatchField = ({
    color,
    label,
    isSelected = false,
    onSelect,
    isEditable = false,
    onColorChange,
}: ColorSwatchFieldProps) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return undefined;

        const timeoutId = window.setTimeout(() => {
            setCopied(false);
        }, 1500);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [copied]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(color);
        setCopied(true);
    };

    return (
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                {label}
            </span>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onSelect}
                    className={cn(
                        "h-11 w-11 shrink-0 rounded-xl border-2 transition-all",
                        isSelected
                            ? "border-blue-400 ring-4 ring-blue-500/20"
                            : "border-white/15 hover:scale-[1.03]",
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${label} color`}
                />
                {isEditable ? (
                    <input
                        type="text"
                        value={color}
                        onChange={(event) =>
                            onColorChange?.(event.target.value)
                        }
                        className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/25 px-3 font-mono text-xs uppercase tracking-[0.16em] text-white outline-none transition focus:border-blue-400"
                    />
                ) : (
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span className="truncate font-mono text-xs uppercase tracking-[0.16em] text-white/75">
                            {color}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={() => {
                                void handleCopy();
                            }}
                            aria-label={`Copy ${label} color`}
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
