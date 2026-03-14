"use client";

import type { PaletteColors } from "./types";

interface PalettePreviewCardProps {
    colors: PaletteColors;
}

export const PalettePreviewCard = ({ colors }: PalettePreviewCardProps) => {
    return (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_22px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="mb-4">
                <h3 className="text-base font-semibold text-white">
                    Live Preview
                </h3>
                <p className="text-sm text-white/55">
                    See your palette in action
                </p>
            </div>

            <div
                className="overflow-hidden rounded-2xl border border-white/10"
                style={{ backgroundColor: colors.background }}
            >
                <div
                    className="flex items-center justify-between px-3 py-2"
                    style={{ borderBottom: `1px solid ${colors.muted}30` }}
                >
                    <div
                        className="h-4 w-16 rounded"
                        style={{ backgroundColor: colors.primary }}
                    />
                    <div className="flex gap-2">
                        <div
                            className="h-2 w-8 rounded"
                            style={{ backgroundColor: colors.muted }}
                        />
                        <div
                            className="h-2 w-8 rounded"
                            style={{ backgroundColor: colors.muted }}
                        />
                    </div>
                </div>

                <div className="space-y-2 p-4">
                    <div
                        className="h-3 w-3/4 rounded"
                        style={{ backgroundColor: colors.text }}
                    />
                    <div
                        className="h-2 w-full rounded"
                        style={{ backgroundColor: colors.muted }}
                    />
                    <div
                        className="h-2 w-2/3 rounded"
                        style={{ backgroundColor: colors.muted }}
                    />
                    <div className="flex gap-2 pt-2">
                        <div
                            className="h-6 w-16 rounded"
                            style={{ backgroundColor: colors.primary }}
                        />
                        <div
                            className="h-6 w-16 rounded border"
                            style={{
                                backgroundColor: "transparent",
                                borderColor: colors.secondary,
                            }}
                        />
                    </div>
                </div>

                <div className="flex gap-2 px-4 pb-4">
                    <div
                        className="flex-1 rounded p-2"
                        style={{ backgroundColor: `${colors.secondary}20` }}
                    >
                        <div
                            className="mb-1 h-2 w-full rounded"
                            style={{ backgroundColor: colors.text }}
                        />
                        <div
                            className="h-1.5 w-2/3 rounded"
                            style={{ backgroundColor: colors.muted }}
                        />
                    </div>
                    <div
                        className="flex-1 rounded p-2"
                        style={{ backgroundColor: `${colors.accent}20` }}
                    >
                        <div
                            className="mb-1 h-2 w-full rounded"
                            style={{ backgroundColor: colors.text }}
                        />
                        <div
                            className="h-1.5 w-2/3 rounded"
                            style={{ backgroundColor: colors.muted }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
