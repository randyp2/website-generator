import { cn } from "@/lib/utils";

/**
 * Spiral path decoded from the original Lottie asset's bezier data, so the
 * artwork matches the source animation exactly.
 */
const SPIRAL_PATH = [
    "M-12 6",
    "C-7.548 6 -5.264 2.284 -4.975 -1.012",
    "C-4.745 -3.639 -5.782 -6 -8 -6",
    "C-10.218 -6 -11.255 -3.639 -11.025 -1.012",
    "C-10.736 2.284 -8.452 6 -4 6",
    "C0.452 6 2.736 2.284 3.025 -1.012",
    "C3.255 -3.639 2.218 -6 0 -6",
    "C-2.218 -6 -3.255 -3.639 -3.025 -1.012",
    "C-2.736 2.284 -0.452 6 4 6",
    "C8.452 6 10.736 2.284 11.025 -1.012",
    "C11.255 -3.639 10.218 -6 8 -6",
    "C5.782 -6 4.748 -3.639 4.98 -1.012",
    "C5.272 2.284 7.557 6 12 6",
].join(" ");

export type SpiralLoaderProps = {
    size?: number;
    className?: string;
};

/**
 * Pure SVG/CSS port of the Lottie spiral loader: a dash window travels along
 * the coil in four quick pulses followed by two slow ones (see the
 * `spiral-loader-travel` keyframes in globals.css). Inherits `currentColor`,
 * so it follows the surrounding text color in both themes.
 */
export function SpiralLoader({ size = 16, className }: SpiralLoaderProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="-13 -7.5 26 15"
            fill="none"
            aria-hidden="true"
            className={cn("shrink-0 opacity-25", className)}
        >
            <path
                d={SPIRAL_PATH}
                pathLength={100}
                stroke="currentColor"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="spiral-loader-path"
            />
        </svg>
    );
}
