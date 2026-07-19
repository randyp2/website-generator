"use client";

import { useState } from "react";
import { FiClock, FiGlobe, FiLoader } from "react-icons/fi";

import { useToast } from "@/hooks/useToast";
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
    const { addToast } = useToast();

    if (isLoading || versions.length === 0) return null;

    // Newest first for a management list (useVersions sorts oldest-first for timelines)
    const newestFirst = [...versions].reverse();
    const activeVersion = versions.find((v) => v.is_active);
    const hasUnpublishedChanges =
        activeVersion !== undefined && !activeVersion.is_published;

    // Badges flip optimistically inside makeLive; on failure it refetches
    // server truth, so all we add here is telling the user it didn't stick
    const handleMakeLive = async (versionId: string): Promise<void> => {
        setPendingVersionId(versionId);
        const succeeded = await makeLive(versionId);
        setPendingVersionId(null);

        if (!succeeded) {
            addToast({
                type: "error",
                title: "Couldn't update the live site",
                description: "Something went wrong while publishing. Please try again.",
            });
        }
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

            <ul className="relative">
                {newestFirst.map((version, index) => {
                    const isPending = isMakingLive && pendingVersionId === version.id;
                    const isLast = index === newestFirst.length - 1;
                    // Chronological position (versions is oldest-first)
                    const chronoIndex = newestFirst.length - 1 - index;
                    const versionLabel =
                        chronoIndex === 0
                            ? "Initial generation"
                            : `Version ${chronoIndex + 1}`;

                    return (
                        <li
                            key={version.id}
                            className={cn(
                                "relative flex items-center justify-between gap-3 pl-6",
                                !isLast && "pb-4",
                            )}
                        >
                            {/* Connector line to the next node */}
                            {!isLast && (
                                <span
                                    aria-hidden="true"
                                    className="absolute left-[4.5px] top-3.5 h-full w-px bg-border"
                                />
                            )}

                            {/* Timeline node: emerald marks the live version */}
                            <span
                                className={cn(
                                    "absolute left-0 top-[5px] z-10 h-2.5 w-2.5 rounded-full",
                                    version.is_published
                                        ? "bg-emerald-400 ring-4 ring-emerald-500/15 shadow-[0_0_10px_rgba(52,211,153,0.45)]"
                                        : "bg-muted-foreground/40 ring-4 ring-background",
                                )}
                            />

                            <div className="flex min-w-0 items-center gap-2.5">
                                <span
                                    className={cn(
                                        "truncate text-xs",
                                        version.is_published
                                            ? "font-semibold text-foreground"
                                            : "font-medium text-muted-foreground",
                                    )}
                                >
                                    {versionLabel}
                                </span>
                                <span className="hidden shrink-0 text-[11px] text-muted-foreground/70 sm:block">
                                    {formatVersionDate(version.created_at)}
                                </span>

                                {version.is_published && (
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                        Live
                                    </span>
                                )}
                            </div>

                            {!version.is_published && (
                                <button
                                    type="button"
                                    onClick={() => void handleMakeLive(version.id)}
                                    disabled={isMakingLive}
                                    className={cn(
                                        "inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors",
                                        "hover:cursor-pointer hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-50",
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
