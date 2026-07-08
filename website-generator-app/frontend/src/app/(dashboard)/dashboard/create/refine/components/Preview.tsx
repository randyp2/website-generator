"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MessageSquare, PanelLeft, EyeOff } from "lucide-react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { atomDark } from "@codesandbox/sandpack-themes";
import { Panel, Group, Separator } from "react-resizable-panels";
import type { SectionDTO, GlobalTheme } from "@/types/portfolio";
import { cn } from "@/lib/utils";
import { SANDPACK_RUNTIME_DEPENDENCIES } from "@/utils/sectionRuntimeScope";
import {
    buildGoogleFontsUrl,
    buildSandpackFiles,
    buildSkeletonOnlyFiles,
    buildWelcomeFiles,
} from "./sandpackFiles";

interface PreviewProps {
    sections: SectionDTO[] | null;
    globalTheme?: GlobalTheme | null;
    generationPhase?: string | null;
    totalSections?: number;
    layoutMode?: "sidebar" | "floating" | "preview";
    sidebarContent?: React.ReactNode;
    onLayoutModeChange?: (mode: "sidebar" | "floating" | "preview") => void;
}

const SANDPACK_OPTIONS = {
    showConsoleButton: true,
    showInlineErrors: true,
    showNavigator: false,
    showLineNumbers: true,
    showTabs: true,
    editorHeight: "calc(100vh)",
    editorWidthPercentage: 0,
    resizablePanels: false,
} as const;

/**
 * Live Sandpack preview of the generated portfolio, with sidebar, floating,
 * and preview-only layout modes. File contents come from sandpackFiles.ts;
 * this component only manages layout and Sandpack lifecycle.
 */
export const Preview: React.FC<PreviewProps> = ({
    sections,
    globalTheme,
    generationPhase,
    totalSections = 0,
    layoutMode = "sidebar",
    sidebarContent,
    onLayoutModeChange,
}) => {
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [showExitMenu, setShowExitMenu] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timeoutId);
    }, []);

    // Global listener for resizing
    useEffect(() => {
        if (!isDragging) return;

        const handlePointerUp = () => setIsDragging(false);

        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);

        // Clean up
        return () => {
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
        };
    }, [isDragging]);

    // How many skeleton placeholders to show
    const isGenerating = generationPhase != null;
    const sectionCount = sections?.length ?? 0;
    const skeletonCount = isGenerating
        ? totalSections > 0
            ? Math.max(0, totalSections - sectionCount)
            : sectionCount === 0
              ? 6
              : 0
        : 0;

    // Generate a key based on section content and theme to force Sandpack re-mount on changes
    const sandpackKey = useMemo(() => {
        if (!sections || sections.length === 0) return `empty-${skeletonCount}`;
        const sectionKey = sections
            .map((s) => `${s.sectionKey}-${(s.reactSource || "").length}`)
            .join("|");
        const themeKey = globalTheme ? JSON.stringify(globalTheme) : "default";
        return `${sectionKey}-${themeKey}-${skeletonCount}`;
    }, [sections, globalTheme, skeletonCount]);

    if (!isMounted) {
        return (
            <div className="absolute inset-0 h-full w-full flex items-center justify-center bg-slate-900">
                <div className="text-slate-400">Loading editor...</div>
            </div>
        );
    }

    const fontUrl = buildGoogleFontsUrl(globalTheme?.fonts);
    const externalResources = [
        "https://cdn.tailwindcss.com",
        ...(fontUrl ? [fontUrl] : []),
    ];

    const files =
        sections && sections.length > 0
            ? buildSandpackFiles(sections, globalTheme, skeletonCount)
            : skeletonCount > 0
              ? buildSkeletonOnlyFiles(globalTheme, skeletonCount)
              : buildWelcomeFiles();

    const sandpack = (
        <Sandpack
            key={sandpackKey}
            files={files}
            customSetup={{ dependencies: SANDPACK_RUNTIME_DEPENDENCIES }}
            theme={atomDark}
            template="react"
            options={{
                externalResources,
                ...SANDPACK_OPTIONS,
            }}
        />
    );

    // Sidebar mode: resizable sidebar + preview
    if (layoutMode === "sidebar" && sidebarContent) {
        return (
            <div className="absolute inset-0 h-full w-full">
                <Group orientation="horizontal">
                    {/* Sidebar Panel */}
                    <Panel>
                        <div className="h-full overflow-hidden">
                            {sidebarContent}
                        </div>
                    </Panel>

                    {/* The Draggable Gutter */}
                    <Separator
                        onPointerDownCapture={() => setIsDragging(true)}
                        className="relative w-3 cursor-col-resize bg-transparent outline-none [&:focus-visible>span]:opacity-90 [&:hover>span]:opacity-90"
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                "pointer-events-none absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-[0_0_0_1px_rgba(0,0,0,0.16),0_8px_24px_rgba(255,255,255,0.28)] transition-opacity duration-150",
                                isDragging && "opacity-90",
                            )}
                        />
                    </Separator>

                    {/* Sandpack Panel */}
                    <Panel>
                        <div className="h-full overflow-hidden relative">
                            {isDragging && (
                                <div
                                    className="absolute inset-0 z-50 cursor-col-resize bg-transparent"
                                    style={{ pointerEvents: "auto" }}
                                />
                            )}
                            {sandpack}
                        </div>
                    </Panel>
                </Group>
            </div>
        );
    }

    // Floating mode or Preview mode: full-width preview
    return (
        <div className="absolute inset-0 h-full w-full">
            {layoutMode === "preview" && onLayoutModeChange && (
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={() => setShowExitMenu((prev) => !prev)}
                        className="w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white/70 hover:text-white hover:bg-black/80 flex items-center justify-center transition-colors"
                        title="Exit preview-only mode"
                    >
                        <EyeOff className="w-4 h-4" />
                    </button>
                    {showExitMenu && (
                        <div className="absolute top-11 right-0 w-44 rounded-xl border border-white/10 bg-[#111318] shadow-lg overflow-hidden">
                            <button
                                onClick={() => {
                                    onLayoutModeChange("sidebar");
                                    setShowExitMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-white/70 hover:bg-white/5 transition-colors"
                            >
                                <PanelLeft className="w-3.5 h-3.5" />
                                Sidebar chat
                            </button>
                            <button
                                onClick={() => {
                                    onLayoutModeChange("floating");
                                    setShowExitMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-white/70 hover:bg-white/5 transition-colors"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Floating chat
                            </button>
                        </div>
                    )}
                </div>
            )}
            {sandpack}
        </div>
    );
};
