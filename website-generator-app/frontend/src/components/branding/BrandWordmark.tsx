import { cn } from "@/lib/utils";

interface BrandWordmarkProps {
    className?: string;
    compact?: boolean;
    portClassName?: string;
    rnChipClassName?: string;
    rnTextClassName?: string;
}

export default function BrandWordmark({
    className,
    compact = false,
    portClassName,
    rnChipClassName,
    rnTextClassName,
}: BrandWordmarkProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 leading-none font-bold tracking-wide",
                className,
            )}
        >
            <span className={cn("text-current", portClassName)}>Port</span>
            <span
                className={cn(
                    "inline-flex items-center bg-primary",
                    compact ? "rounded-[2px] px-1 py-0.5" : "rounded-[2px] px-1.5 py-0.5",
                    rnChipClassName,
                )}
            >
                <span
                    className={cn(
                        "font-extrabold text-white dark:text-primary-foreground",
                        rnTextClassName,
                    )}
                >
                    RN
                </span>
            </span>
        </span>
    );
}
