import { Skeleton } from "@/components/ui/skeleton";
import type { LayoutStyleKey } from "./types";

const SpaciousPreview = () => (
    <div className="flex flex-col gap-3 p-3">
        <Skeleton className="h-8 w-full rounded bg-white/10" />
        <div className="h-2" />
        <Skeleton className="h-5 w-3/4 rounded bg-white/10" />
        <div className="h-2" />
        <Skeleton className="h-5 w-full rounded bg-white/10" />
        <div className="h-2" />
        <Skeleton className="h-8 w-full rounded bg-white/10" />
    </div>
);

const CompactPreview = () => (
    <div className="flex flex-col gap-1.5 p-3">
        <Skeleton className="h-4 w-full rounded bg-white/10" />
        <Skeleton className="h-4 w-full rounded bg-white/10" />
        <Skeleton className="h-3 w-2/3 rounded bg-white/10" />
        <Skeleton className="h-4 w-full rounded bg-white/10" />
        <Skeleton className="h-4 w-full rounded bg-white/10" />
        <Skeleton className="h-3 w-1/2 rounded bg-white/10" />
        <Skeleton className="h-4 w-full rounded bg-white/10" />
    </div>
);

const BentoPreview = () => (
    <div className="grid grid-cols-3 gap-1.5 p-3">
        <Skeleton className="col-span-2 h-12 rounded bg-white/10" />
        <Skeleton className="h-12 rounded bg-white/10" />
        <Skeleton className="h-10 rounded bg-white/10" />
        <Skeleton className="col-span-2 h-10 rounded bg-white/10" />
        <Skeleton className="col-span-3 h-6 rounded bg-white/10" />
    </div>
);

const MasonryPreview = () => (
    <div className="grid grid-cols-3 gap-1.5 p-3">
        <div className="flex flex-col gap-1.5">
            <Skeleton className="h-14 rounded bg-white/10" />
            <Skeleton className="h-8 rounded bg-white/10" />
        </div>
        <div className="flex flex-col gap-1.5">
            <Skeleton className="h-8 rounded bg-white/10" />
            <Skeleton className="h-14 rounded bg-white/10" />
        </div>
        <div className="flex flex-col gap-1.5">
            <Skeleton className="h-10 rounded bg-white/10" />
            <Skeleton className="h-10 rounded bg-white/10" />
        </div>
    </div>
);

const DynamicPreview = () => (
    <div className="flex flex-col gap-1.5 p-3">
        <Skeleton className="h-8 w-full rounded bg-white/10" />
        <div className="grid grid-cols-2 gap-1.5">
            <Skeleton className="h-8 rounded bg-white/10" />
            <Skeleton className="h-8 rounded bg-white/10" />
        </div>
        <Skeleton className="h-6 w-full rounded bg-white/10" />
        <div className="grid grid-cols-3 gap-1.5">
            <Skeleton className="h-6 rounded bg-white/10" />
            <Skeleton className="h-6 rounded bg-white/10" />
            <Skeleton className="h-6 rounded bg-white/10" />
        </div>
    </div>
);

export const LAYOUT_PREVIEWS: Record<LayoutStyleKey, React.FC> = {
    spacious: SpaciousPreview,
    compact: CompactPreview,
    bento: BentoPreview,
    masonry: MasonryPreview,
    dynamic: DynamicPreview,
};
