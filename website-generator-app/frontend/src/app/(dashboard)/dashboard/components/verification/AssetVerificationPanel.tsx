"use client";

import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Loader2,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AssetJobPhase, PendingAssetView } from "./verification.types";
import { useAssetVerificationStatus } from "./useAssetVerificationStatus";

interface AssetVerificationPanelProps {
    view: PendingAssetView;
    onBack: () => void;
}

interface PhaseConfig {
    label: string;
    icon: React.ElementType;
    className: string;
    spin?: boolean;
}

const PHASE_CONFIG: Record<AssetJobPhase, PhaseConfig> = {
    QUEUED: {
        label: "Queued",
        icon: Clock,
        className:
            "text-muted-foreground bg-muted border-border",
    },
    PROCESSING: {
        label: "Processing",
        icon: Loader2,
        className:
            "text-amber-600 bg-amber-500/10 border-amber-500/30",
        spin: true,
    },
    COMPLETED: {
        label: "Verified",
        icon: CheckCircle2,
        className:
            "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
    },
    FAILED: {
        label: "Failed",
        icon: AlertTriangle,
        className: "text-red-500 bg-red-500/10 border-red-500/30",
    },
};

const formatConfidence = (confidence: number): string =>
    `${Math.round(confidence * 100)}%`;

const PhaseBadge = ({ phase }: { phase: AssetJobPhase }) => {
    const config = PHASE_CONFIG[phase];
    const Icon = config.icon;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                config.className,
            )}
        >
            <Icon className={cn("h-3 w-3", config.spin && "animate-spin")} />
            {config.label}
        </span>
    );
};

const VerificationMetricRow = ({
    phase,
    label,
    value,
}: {
    phase: AssetJobPhase | null;
    label: string;
    value: number | null;
}) => {
    const isPending = phase === null || phase === "QUEUED" || phase === "PROCESSING";
    const isFailed = phase === "FAILED";

    return (
        <div className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            {isPending ? (
                <Skeleton className="h-4 w-12" />
            ) : isFailed ? (
                <span className="text-xs text-red-500">N/A</span>
            ) : value !== null ? (
                <span className="text-sm font-semibold text-emerald-600">
                    {formatConfidence(value)}
                </span>
            ) : (
                <Skeleton className="h-4 w-12" />
            )}
        </div>
    );
};

const SummaryCard = ({
    phase,
    summary,
    analysisError,
}: {
    phase: AssetJobPhase | null;
    summary: string | null;
    analysisError: string | null;
}) => {
    const isPending = phase === null || phase === "QUEUED" || phase === "PROCESSING";
    const isFailed = phase === "FAILED";

    return (
        <div className="rounded-md border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                    AI Summary
                </p>
            </div>
            {isPending ? (
                <div className="space-y-2 pt-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            ) : isFailed ? (
                <p className="text-sm text-red-500 leading-relaxed">
                    {analysisError?.trim() ||
                        "AI verification failed. Try uploading a different file."}
                </p>
            ) : summary ? (
                <p className="text-sm text-foreground leading-relaxed">{summary}</p>
            ) : (
                <div className="space-y-2 pt-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>
            )}
        </div>
    );
};

const AssetVerificationPanel = ({ view, onBack }: AssetVerificationPanelProps) => {
    const { phase, matchConfidence, evidenceDepth, summary, analysisError } = useAssetVerificationStatus(
        view.claimId,
        view.uploadId,
        view.jobId,
    );

    return (
        <div className="space-y-4">
            <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="w-fit gap-1.5 px-0 hover:cursor-pointer"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to claim details
            </Button>

            <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
                <div>
                    <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                        Asset
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground break-all">
                        {view.originalFileName}
                    </p>
                </div>

                {phase && <PhaseBadge phase={phase} />}

                <VerificationMetricRow
                    phase={phase}
                    label="Claim Match"
                    value={matchConfidence}
                />
                <VerificationMetricRow
                    phase={phase}
                    label="Evidence Depth"
                    value={evidenceDepth}
                />
            </div>

            <SummaryCard
                phase={phase}
                summary={summary}
                analysisError={analysisError}
            />
        </div>
    );
};

export default AssetVerificationPanel;
