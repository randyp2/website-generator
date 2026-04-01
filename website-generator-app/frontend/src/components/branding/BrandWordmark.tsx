import { cn } from "@/lib/utils";

interface BrandWordmarkProps {
    className?: string;
    compact?: boolean;
    wordClassName?: string;
    aiChipClassName?: string;
    aiTextClassName?: string;
}

export default function BrandWordmark({
    className,
    compact = false,
    wordClassName,
    aiChipClassName,
    aiTextClassName,
}: BrandWordmarkProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 leading-none font-bold tracking-wide",
                className,
            )}
        >
            <span className={cn("text-current", wordClassName)}>aera</span>
            <span
                className={cn(
                    "inline-flex items-center bg-primary",
                    compact ? "rounded-[2px] px-1 py-0.5" : "rounded-[2px] px-1.5 py-0.5",
                    aiChipClassName,
                )}
            >
                <span className={cn("font-extrabold text-primary-foreground", aiTextClassName)}>
                    .ai
                </span>
            </span>
        </span>
    );
}
