"use client";

import { useState } from "react";
import { LAYOUT_DEFINITIONS } from "./constants";
import { LayoutPreviewCard } from "./LayoutPreviewCard";
import type { LayoutPreviewGridProps } from "./types";

export const LayoutPreviewGrid = ({
    suggestions,
    onSelect,
}: LayoutPreviewGridProps) => {
    const [selected, setSelected] = useState<string | null>(null);

    const normalizedSuggestions = suggestions.map((s) => s.toLowerCase().trim());

    const matchedLayouts = LAYOUT_DEFINITIONS.filter((def) => {
        const name = def.name.toLowerCase();
        return normalizedSuggestions.some(
            (s) => s === name || s.startsWith(name),
        );
    });

    if (matchedLayouts.length === 0) return null;

    const handleSelect = (name: string) => {
        setSelected(name);
        onSelect(name);
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {matchedLayouts.map((def) => (
                <LayoutPreviewCard
                    key={def.key}
                    definition={def}
                    isSelected={selected === def.name}
                    onSelect={() => handleSelect(def.name)}
                />
            ))}
        </div>
    );
};
