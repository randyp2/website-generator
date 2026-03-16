export type LayoutStyleKey =
    | "spacious"
    | "compact"
    | "bento"
    | "masonry"
    | "dynamic";

export interface LayoutPreviewDefinition {
    key: LayoutStyleKey;
    name: string;
    description: string;
}

export interface LayoutPreviewCardProps {
    definition: LayoutPreviewDefinition;
    isSelected: boolean;
    onSelect: () => void;
}

export interface LayoutPreviewGridProps {
    suggestions: string[];
    onSelect: (name: string) => void;
}
