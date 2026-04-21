import { cn } from "@/lib/utils";

interface BrandWordmarkProps {
    className?: string;
    compact?: boolean;
}

export default function BrandWordmark({
    className,
    compact = false,
}: BrandWordmarkProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center leading-none font-bold tracking-wide",
                compact ? "[font-size:1.08em]" : "[font-size:1.2em]",
                className,
            )}
        >
            PortRN
        </span>
    );
}
