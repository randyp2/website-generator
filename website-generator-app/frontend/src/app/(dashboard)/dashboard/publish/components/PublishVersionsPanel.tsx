"use client";

import { useState } from "react";
import { FiClock, FiEdit3, FiGlobe, FiLoader } from "react-icons/fi";

import { useVersions } from "@/hooks/useVersions";
import { cn } from "@/lib/utils";

interface PublishVersionsPanelProps {
    portfolioId: string;
}

const formatVersionDate = (iso: string): string =>
    new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

/**
 * Version management for a live portfolio: shows which version visitors see,
 * flags when the editor is ahead, and lets any version be made live in one
 * action (restore into the editor + pin). Renders nothing for portfolios
 * without versions (e.g. external links).
 */
export const PublishVersionsPanel = ({ portfolioId }: PublishVersionsPanelProps) => {
    const { versions, isLoading, makeLive, isMakingLive } = useVersions(portfolioId);
    const [pendingVersionId, setPendingVersionId] = useState<string | null>(null);

    if (isLoading || versions.length === 0) return null;

    // Newest first for a management list (useVersions sorts oldest-first for timelines)
    const newestFirst = [...versions].reverse();
    const activeVersion = versions.find((v) => v.is_active);
    const hasUnpublishedChanges =
        activeVersion !== undefined && !activeVersion.is_published;

    const handleMakeLive = async (versionId: string): Promise<void> => {
        setPendingVersionId(versionId);
        await makeLive(versionId);
        setPendingVersionId(null);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <FiClock className="h-3 w-3" />
                    Versions
                </h2>

                {hasUnpublishedChanges && (
                    <button
                        type="button"
                        onClick={() => void handleMakeLive(activeVersion.id)}
                        disabled={isMakingLive}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition-colors hover:cursor-pointer hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isMakingLive && pendingVersionId === activeVersion.id ? (
                            <FiLoader className="h-3 w-3 animate-spin" />
                        ) : (
                            <FiGlobe className="h-3 w-3" />
                        )}
                        Publish latest changes
                    </button>
                )}
            </div>

            <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                {newestFirst.map((version) => {
                    const isPending = isMakingLive && pendingVersionId === version.id;

                    return (
                        <li
                            key={version.id}
                            className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="truncate text-xs font-medium text-foreground">
                                    {formatVersionDate(version.created_at)}
                                </span>

                                {version.is_published && (
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                        Live
                                    </span>
                                )}
                                {version.is_active && !version.is_published && (
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-400/25 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                                        <FiEdit3 className="h-2.5 w-2.5" />
                                        In editor
                                    </span>
                                )}
                            </div>

                            {!version.is_published && (
                                <button
                                    type="button"
                                    onClick={() => void handleMakeLive(version.id)}
                                    disabled={isMakingLive}
                                    className={cn(
                                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors",
                                        "hover:cursor-pointer hover:border-orange-400/50 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-50",
                                    )}
                                >
                                    {isPending ? (
                                        <FiLoader className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <FiGlobe className="h-3 w-3" />
                                    )}
                                    Make live
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PublishVersionsPanel;
