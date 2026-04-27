"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { LayoutModeToggle, type ChatLayoutMode } from "./LayoutModeToggle";

interface PreviewActionBarProps {
    onDownload: () => Promise<void>;
    isDownloading?: boolean;
    disabled?: boolean;
    layoutMode?: ChatLayoutMode;
    onLayoutModeChange?: (mode: ChatLayoutMode) => void;
}

export const PreviewActionBar: React.FC<PreviewActionBarProps> = ({
    onDownload,
    isDownloading = false,
    disabled = false,
    layoutMode = 'sidebar',
    onLayoutModeChange,
}) => {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        if (downloading || disabled) return;

        setDownloading(true);
        setError(null);

        try {
            await onDownload();
        } catch (err) {
            console.error("Download error:", err);
            setError(err instanceof Error ? err.message : "Download failed");
            // Clear error after 3 seconds
            setTimeout(() => setError(null), 3000);
        } finally {
            setDownloading(false);
        }
    };

    const isLoading = downloading || isDownloading;

    return (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            {error && (
                <div className="bg-red-500/90 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg">
                    {error}
                </div>
            )}
            {onLayoutModeChange && (
                <LayoutModeToggle
                    mode={layoutMode}
                    onChange={onLayoutModeChange}
                />
            )}
            <button
                onClick={handleDownload}
                disabled={isLoading || disabled}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-sm
                    font-medium text-sm transition-all duration-200
                    shadow-lg backdrop-blur-sm
                    ${isLoading || disabled
                        ? "bg-slate-600/80 text-slate-400 cursor-not-allowed"
                        : "bg-white hover:bg-slate-100 text-slate-900 hover:shadow-xl"
                    }
                `}
                title="Download as standalone HTML file"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Exporting...</span>
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4" />
                        <span>Download HTML</span>
                    </>
                )}
            </button>
        </div>
    );
};
