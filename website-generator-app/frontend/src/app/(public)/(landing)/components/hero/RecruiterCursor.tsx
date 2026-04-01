"use client";

import type { JSX } from "react";
import { useEffect, useState } from "react";

interface CursorData {
    id: string;
    name: string;
    role: string;
    color: string;
    x: number;
    y: number;
    rotation: string;
}

type CursorIconProps = {
    color: string;
};

type AnimatedCursorProps = {
    cursor: CursorData;
};

const CURSORS: readonly CursorData[] = [
    {
        id: "1",
        name: "HR",
        role: "Recruiter",
        color: "#3b82f6",
        x: 20,
        y: 70,
        rotation: "rotate-[-8deg]",
    },
    {
        id: "2",
        name: "Mark",
        role: "Recruiter",
        color: "#ec4899",
        x: 40,
        y: 45,
        rotation: "rotate-[6deg]",
    },
    {
        id: "3",
        name: "Talent",
        role: "HR Team",
        color: "#f59e0b",
        x: 72,
        y: 68,
        rotation: "rotate-[10deg]",
    },
] as const;

const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

const CursorIcon = ({ color }: CursorIconProps): JSX.Element => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
    >
        <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-5.07h7.66c.59 0 .79-.77.26-1.02L5.94 2.85c-.34-.17-.75.06-.75.36z"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const AnimatedCursor = ({ cursor }: AnimatedCursorProps): JSX.Element => {
    const [position, setPosition] = useState<{ x: number; y: number }>({
        x: cursor.x,
        y: cursor.y,
    });
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        const entranceDelay = Number.parseInt(cursor.id, 10) * 400;
        const entranceTimer = window.setTimeout(
            () => setIsVisible(true),
            entranceDelay,
        );

        const moveInterval = window.setInterval(
            () => {
                setPosition((previousPosition) => ({
                    x: clamp(
                        previousPosition.x + (Math.random() - 0.5) * 8,
                        0,
                        92,
                    ),
                    y: clamp(
                        previousPosition.y + (Math.random() - 0.5) * 6,
                        0,
                        88,
                    ),
                }));
            },
            2000 + Math.random() * 1000,
        );

        return () => {
            window.clearTimeout(entranceTimer);
            window.clearInterval(moveInterval);
        };
    }, [cursor.id]);

    return (
        <div
            className={`absolute z-[60] pointer-events-none transition-all duration-1000 ease-out ${cursor.rotation}`}
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "scale(1)" : "scale(0.5)",
            }}
        >
            <CursorIcon color={cursor.color} />
            <div
                className="absolute left-4 top-4 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium text-white shadow-lg"
                style={{ backgroundColor: cursor.color }}
            >
                <span>{cursor.name}</span>
                <span className="ml-1 text-white/70">({cursor.role})</span>
            </div>
        </div>
    );
};

const LiveCursors = (): JSX.Element => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {CURSORS.map((cursor) => (
            <AnimatedCursor key={cursor.id} cursor={cursor} />
        ))}
    </div>
);

export default LiveCursors;
