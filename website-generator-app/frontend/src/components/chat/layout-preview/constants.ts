import type { LayoutPreviewDefinition } from "./types";

export const LAYOUT_DEFINITIONS: LayoutPreviewDefinition[] = [
    {
        key: "spacious",
        name: "Spacious",
        description: "Generous whitespace with full-width sections and breathing room between elements",
    },
    {
        key: "compact",
        name: "Compact",
        description: "Dense, information-rich layout that maximizes content visibility",
    },
    {
        key: "bento",
        name: "Bento",
        description: "Grid-based cards of varying sizes, inspired by Japanese bento box design",
    },
    {
        key: "masonry",
        name: "Masonry",
        description: "Pinterest-style staggered grid that adapts to content height",
    },
    {
        key: "dynamic",
        name: "Dynamic",
        description: "Mixed layout with alternating full-width and multi-column sections",
    },
];
