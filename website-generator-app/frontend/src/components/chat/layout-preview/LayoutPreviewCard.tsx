"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { LAYOUT_PREVIEWS } from "./previews";
import type { LayoutPreviewCardProps } from "./types";

export const LayoutPreviewCard = ({
    definition,
    isSelected,
    onSelect,
}: LayoutPreviewCardProps) => {
    const PreviewComponent = LAYOUT_PREVIEWS[definition.key];

    return (
        <Card
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect();
                }
            }}
            className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden border-white/10 bg-white/[0.04] transition-all hover:border-white/20 hover:bg-white/[0.07]",
                isSelected && "border-blue-500/50 bg-blue-500/[0.08] hover:border-blue-500/60",
            )}
        >
            <div className="flex h-32 items-center justify-center rounded-t-lg border-b border-white/5 bg-white/[0.02]">
                <div className="w-full">
                    <PreviewComponent />
                </div>
            </div>

            <div className="flex flex-1 items-start justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0">
                    <Badge
                        variant="secondary"
                        className="mb-1 bg-white/10 text-xs text-white/80 hover:bg-white/10"
                    >
                        {definition.name}
                    </Badge>
                    <p className="text-xs leading-snug text-white/50">
                        {definition.description}
                    </p>
                </div>

                {isSelected && (
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                        <Check className="h-3 w-3 text-white" />
                    </div>
                )}
            </div>
        </Card>
    );
};
