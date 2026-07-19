"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    type ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { cn } from "@/lib/utils";

interface PaletteCarouselProps {
    children: ReactNode;
}

interface CarouselArrowProps {
    direction: "left" | "right";
    onClick: () => void;
}

const CarouselArrow = ({ direction, onClick }: CarouselArrowProps) => {
    const Icon = direction === "left" ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={
                direction === "left"
                    ? "Scroll palettes left"
                    : "Scroll palettes right"
            }
            className={cn(
                "absolute top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border shadow-md transition",
                direction === "left" ? "left-0" : "right-0",
                "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/15 dark:bg-neutral-900/90 dark:text-white dark:hover:bg-neutral-900",
            )}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
};

/**
 * Horizontal snap-scrolling strip for palette cards with chevron paging.
 * Arrows only render when there is overflow in that direction; scroll state
 * is refreshed on scroll, on resize, and whenever children change.
 */
export const PaletteCarousel = ({ children }: PaletteCarouselProps) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        setCanScrollLeft(track.scrollLeft > 1);
        setCanScrollRight(
            track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
        );
    }, []);

    useEffect(() => {
        updateScrollState();
        const track = trackRef.current;
        if (!track) return;
        const observer = new ResizeObserver(updateScrollState);
        observer.observe(track);
        return () => observer.disconnect();
    }, [updateScrollState, children]);

    const scrollByPage = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        track.scrollBy({
            left: direction * track.clientWidth * 0.8,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative">
            <div
                ref={trackRef}
                onScroll={updateScrollState}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-7 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {children}
            </div>
            {canScrollLeft && (
                <CarouselArrow
                    direction="left"
                    onClick={() => scrollByPage(-1)}
                />
            )}
            {canScrollRight && (
                <CarouselArrow
                    direction="right"
                    onClick={() => scrollByPage(1)}
                />
            )}
        </div>
    );
};
