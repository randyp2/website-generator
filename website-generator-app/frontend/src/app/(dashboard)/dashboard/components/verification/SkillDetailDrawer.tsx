"use client";

import { motion } from "framer-motion";
import {
    Award,
    BookOpen,
    Briefcase,
    ClipboardCheck,
    FileText,
    AlertTriangle,
    Link2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { EvidenceType, SkillDetailDrawerProps } from "./verification.types";
import {
    getTierColor,
    getTierBgColor,
    getTierRingColor,
    getFreshnessLabel,
    getEvidenceMixForSkill,
    getQualityBadgeVariant,
    EVIDENCE_TYPE_COLORS,
    EVIDENCE_TYPE_LABELS,
} from "./verification.utils";
import ClaimEvidenceUploadSection from "./ClaimEvidenceUploadSection";

const CIRCUMFERENCE = 2 * Math.PI * 36;

const EVIDENCE_TYPE_ICONS: Record<EvidenceType, React.ElementType> = {
    endorsement: Award,
    certification: ClipboardCheck,
    project: Briefcase,
    assessment: BookOpen,
    self_reported: FileText,
};

const SkillDetailDrawer = ({
    skill,
    evidence,
    open,
    isDeletingClaim,
    deleteError,
    showClaimControls = true,
    onDeleteClaim,
    onClose,
}: SkillDetailDrawerProps) => {
    if (!skill) return null;

    const offset = CIRCUMFERENCE - (skill.score / 100) * CIRCUMFERENCE;
    const freshness = getFreshnessLabel(skill.freshness);
    const mix = getEvidenceMixForSkill(skill);
    const suggestedActions = skill.suggestedActions ?? [];
    const lastVerifiedDate = new Date(skill.lastVerified).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric", year: "numeric" },
    );

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-3">
                        {skill.name}
                        <Badge
                            className={cn(
                                "text-[10px]",
                                getTierBgColor(skill.tier),
                                getTierColor(skill.tier),
                            )}
                        >
                            {skill.tier}
                        </Badge>
                    </SheetTitle>
                    <SheetDescription>Last verified {lastVerifiedDate}</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 pb-6">
                    {/* Score Ring */}
                    <div className="flex items-center gap-4">
                        <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0">
                            <circle
                                cx="40" cy="40" r="36"
                                fill="none" stroke="currentColor"
                                className="text-muted-foreground/30" strokeWidth="6"
                            />
                            <motion.circle
                                cx="40" cy="40" r="36"
                                fill="none" stroke="currentColor"
                                className={getTierRingColor(skill.tier)}
                                strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={CIRCUMFERENCE}
                                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                transform="rotate(-90 40 40)"
                            />
                            <text
                                x="40" y="40"
                                textAnchor="middle" dominantBaseline="central"
                                className="fill-foreground font-bold"
                                style={{ fontSize: "18px", fontWeight: 700 }}
                            >
                                {skill.score}
                            </text>
                        </svg>
                        <div>
                            <p className="text-sm text-foreground font-medium">Verification Score</p>
                            <p className={cn("text-xs", freshness.color)}>Freshness: {freshness.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{skill.evidenceCount} evidence items</p>
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="rounded-md border border-border bg-muted/30 p-3">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                            Score Breakdown
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <p className="text-muted-foreground">Starting Score</p>
                                <p className="font-semibold text-foreground">{skill.baselineScore}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Boost from Projects</p>
                                <p className={cn(
                                    "font-semibold",
                                    skill.evidenceContribution > 0 && "text-emerald-500",
                                    skill.evidenceContribution < 0 && "text-red-500",
                                    skill.evidenceContribution === 0 && "text-foreground",
                                )}>
                                    {skill.evidenceContribution > 0 ? "+" : ""}
                                    {skill.evidenceContribution}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Sources Found</p>
                                <p className="font-semibold text-foreground">{skill.evidenceLinksUsed}</p>
                            </div>
                        </div>
                        <div className="mt-3 border-t border-border pt-3">
                            <p className="text-[11px] font-medium text-foreground">What this means</p>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                {skill.scoreReasonText}
                            </p>
                        </div>
                    </div>

                    {/* Evidence Breakdown */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            Evidence Breakdown
                        </h4>
                        <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                            {mix.filter((s) => s.percentage > 0).map((segment) => (
                                <div
                                    key={segment.type}
                                    className={cn("h-full", EVIDENCE_TYPE_COLORS[segment.type])}
                                    style={{ width: `${segment.percentage}%` }}
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {mix.map((segment) => {
                                const Icon = EVIDENCE_TYPE_ICONS[segment.type];
                                return (
                                    <div key={segment.type} className="flex items-center gap-2 text-xs">
                                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {EVIDENCE_TYPE_LABELS[segment.type]}
                                        </span>
                                        <span className="font-medium text-foreground ml-auto">
                                            {segment.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Evidence Items */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            Evidence Items
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {evidence.map((item) => {
                                const Icon = EVIDENCE_TYPE_ICONS[item.type];
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-start gap-2.5 p-2.5 rounded-md border border-border bg-muted"
                                    >
                                        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {item.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] h-4">
                                                    {item.source}
                                                </Badge>
                                                <Badge
                                                    variant={getQualityBadgeVariant(item.quality)}
                                                    className="text-[10px] h-4"
                                                >
                                                    {item.quality}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(item.date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {evidence.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4">
                                    No evidence items found for this skill.
                                </p>
                            )}
                        </div>
                    </div>

                    <ClaimEvidenceUploadSection claimId={skill.id} />

                    {/* Conflicts */}
                    {skill.conflictDetails && skill.conflictDetails.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                What Doesn&apos;t Match
                            </h4>
                            {skill.conflictDetails.map((conflict, i) => (
                                <div
                                    key={i}
                                    className="rounded-md border border-red-400/30 bg-red-400/5 p-3 space-y-2"
                                >
                                    <div className="text-xs">
                                        <span className="font-medium text-foreground">{conflict.source}</span>
                                        <span className="text-muted-foreground"> says: </span>
                                        <span className="text-foreground italic">&ldquo;{conflict.claim}&rdquo;</span>
                                    </div>
                                    <div className="text-xs">
                                        <span className="font-medium text-foreground">{conflict.counterSource}</span>
                                        <span className="text-muted-foreground"> says: </span>
                                        <span className="text-foreground italic">&ldquo;{conflict.counterClaim}&rdquo;</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Suggested Actions */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            Suggested Actions
                        </h4>
                        {suggestedActions.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {suggestedActions.map((item) => (
                                    <Button
                                        key={`${skill.id}-${item.action}-${item.priority}`}
                                        variant="outline"
                                        size="sm"
                                        className="justify-start gap-2 hover:cursor-pointer"
                                    >
                                        <Link2 className="h-3.5 w-3.5" />
                                        {item.action}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                No suggested actions for this claim yet.
                            </p>
                        )}
                    </div>

                    {/* Claim Controls */}
                    {showClaimControls && (
                        <div className="space-y-2 border-t border-border pt-4">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Claim Controls
                            </h4>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full hover:cursor-pointer"
                                disabled={isDeletingClaim}
                                onClick={async () => {
                                    const confirmed = window.confirm(
                                        "Delete this claim from your verification list?",
                                    );
                                    if (!confirmed) return;
                                    await onDeleteClaim(skill.id);
                                }}
                            >
                                {isDeletingClaim ? "Deleting claim..." : "Delete Claim"}
                            </Button>
                            {deleteError && (
                                <p className="text-xs text-destructive">{deleteError}</p>
                            )}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default SkillDetailDrawer;
