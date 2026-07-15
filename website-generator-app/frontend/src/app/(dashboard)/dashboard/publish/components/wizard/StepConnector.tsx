"use client";

import { useEffect, useState, type RefObject } from "react";

interface StepConnectorProps {
    containerRef: RefObject<HTMLDivElement | null>;
    sourceRef: RefObject<HTMLDivElement | null>;
    targetRef: RefObject<HTMLDivElement | null>;
}

interface Geometry {
    width: number;
    height: number;
    path: string;
    source: { x: number; y: number };
    target: { x: number; y: number };
}

/**
 * Dashed bezier connector drawn from the bottom-center of the source box to the
 * left-center of the target box, measured relative to a shared container. It
 * recomputes on resize and renders nothing when the boxes stack vertically
 * (narrow layout), where a diagonal connector would not make sense.
 */
export const StepConnector = ({
    containerRef,
    sourceRef,
    targetRef,
}: StepConnectorProps) => {
    const [geometry, setGeometry] = useState<Geometry | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        const source = sourceRef.current;
        const target = targetRef.current;
        if (!container || !source || !target) return;

        const measure = () => {
            const containerRect = container.getBoundingClientRect();
            const sourceRect = source.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();

            const sx =
                sourceRect.left + sourceRect.width / 2 - containerRect.left;
            const sy = sourceRect.bottom - containerRect.top;
            const tx = targetRect.left - containerRect.left;
            const ty =
                targetRect.top + targetRect.height / 2 - containerRect.top;

            // Only draw for the side-by-side layout: the target must sit to the
            // right of the source. When stacked, the target is full width and
            // starts left of the source center, so we hide the connector.
            if (tx <= sx) {
                setGeometry(null);
                return;
            }

            const curve = Math.max((ty - sy) * 0.6, 40);
            const path = `M ${sx},${sy} C ${sx},${sy + curve} ${tx - curve},${ty} ${tx},${ty}`;

            setGeometry({
                width: containerRect.width,
                height: containerRect.height,
                path,
                source: { x: sx, y: sy },
                target: { x: tx, y: ty },
            });
        };

        measure();
        // Re-measure after paint so the path settles once fonts and the step
        // enter-transition have applied their final layout.
        const raf = requestAnimationFrame(measure);

        const observer = new ResizeObserver(measure);
        observer.observe(container);
        observer.observe(source);
        observer.observe(target);
        window.addEventListener("resize", measure);

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [containerRef, sourceRef, targetRef]);

    if (!geometry) return null;

    const { source, target } = geometry;

    return (
        <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-10 hidden text-primary/70 md:block"
            width={geometry.width}
            height={geometry.height}
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            fill="none"
        >
            <path
                d={geometry.path}
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="5 6"
                strokeLinecap="round"
            />
            <circle cx={source.x} cy={source.y} r={4} className="fill-primary" />
            <path
                d={`M ${target.x - 8},${target.y - 5} L ${target.x},${target.y} L ${target.x - 8},${target.y + 5}`}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
