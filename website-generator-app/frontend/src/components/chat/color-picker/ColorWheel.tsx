"use client";

import { Pipette } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

interface ColorWheelProps {
    selectedColor: string;
    onColorSelect: (color: string) => void;
}

const toHex = (value: number) => value.toString(16).padStart(2, "0");

export const ColorWheel = ({
    selectedColor,
    onColorSelect,
}: ColorWheelProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let angle = 0; angle < 360; angle += 1) {
            const startAngle = ((angle - 1) * Math.PI) / 180;
            const endAngle = ((angle + 1) * Math.PI) / 180;

            context.beginPath();
            context.moveTo(centerX, centerY);
            context.arc(centerX, centerY, radius, startAngle, endAngle);
            context.closePath();

            const gradient = context.createRadialGradient(
                centerX,
                centerY,
                0,
                centerX,
                centerY,
                radius,
            );
            gradient.addColorStop(0, `hsl(${angle}, 0%, 100%)`);
            gradient.addColorStop(0.55, `hsl(${angle}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${angle}, 100%, 24%)`);

            context.fillStyle = gradient;
            context.fill();
        }

        context.beginPath();
        context.arc(centerX, centerY, 22, 0, Math.PI * 2);
        context.fillStyle = selectedColor;
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = "rgba(255,255,255,0.65)";
        context.stroke();
    }, [selectedColor]);

    const handleColorPick = (event: MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const context = canvas.getContext("2d");
        if (!context) return;

        const pixel = context.getImageData(x, y, 1, 1).data;
        const nextColor = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
        onColorSelect(nextColor);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <canvas
                ref={canvasRef}
                width={220}
                height={220}
                className="cursor-crosshair rounded-full border border-white/10 bg-black/20 shadow-[0_18px_36px_rgba(0,0,0,0.28)]"
                onClick={handleColorPick}
                onMouseDown={() => setIsDragging(true)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={(event) => {
                    if (isDragging) {
                        handleColorPick(event);
                    }
                }}
                onMouseUp={() => setIsDragging(false)}
            />
            <div className="flex items-center gap-2 text-xs text-white/60">
                <Pipette className="h-4 w-4" />
                <span>Click or drag to pick a color</span>
            </div>
        </div>
    );
};
