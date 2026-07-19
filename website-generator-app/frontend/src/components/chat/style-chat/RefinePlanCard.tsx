"use client";

import { Button } from "@/components/ui/button";
import type { SectionPlan } from "@/types/preview";

interface RefinePlanCardProps {
    summary?: string;
    plans: SectionPlan[];
}

/**
 * Shared plan preview used when refine chat moves from clarification to build.
 */
export const RefinePlanCard: React.FC<RefinePlanCardProps> = ({
    summary,
    plans,
}) => (
    <div className="rounded-2xl border border-orange-400/30 bg-orange-50/80 px-4 py-3 text-foreground shadow-[0_18px_48px_rgba(249,115,22,0.12)] dark:border-orange-900/45 dark:bg-orange-950/35 dark:text-orange-50 dark:shadow-[0_18px_48px_rgba(124,45,18,0.24)]">
        <PlanEyebrow label="Plan ready" />
        {summary && (
            <div className="mt-2 text-sm text-foreground dark:text-orange-50">
                {summary}
            </div>
        )}
        <div className="mt-3 space-y-2">
            {plans.map((plan) => (
                <PlanStep key={plan.sectionKey} plan={plan} />
            ))}
        </div>
        <div className="mt-3 text-xs text-orange-700/80 dark:text-orange-200/70">
            Approve to apply, or keep chatting to adjust.
        </div>
    </div>
);

interface PlanApprovalBarProps {
    isGenerating: boolean;
    onApprovePlan?: () => void;
    onKeepChatting?: () => void;
}

/**
 * Shared refine action bar shown once a plan is ready to be applied.
 */
export const PlanApprovalBar: React.FC<PlanApprovalBarProps> = ({
    isGenerating,
    onApprovePlan,
    onKeepChatting,
}) => (
    <div className="border-t border-border px-4 py-3 dark:border-orange-500/10">
        <div className="flex flex-col gap-3 rounded-2xl border border-orange-400/30 bg-orange-50/80 px-4 py-3 text-foreground shadow-[0_18px_48px_rgba(249,115,22,0.12)] dark:border-orange-900/45 dark:bg-orange-950/35 dark:text-orange-50 dark:shadow-[0_18px_48px_rgba(124,45,18,0.24)]">
            <PlanEyebrow label="Approve plan" />
            <div className="text-sm text-foreground/90 dark:text-orange-100/80">
                Review the planned changes, then apply or keep refining.
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    onClick={onApprovePlan}
                    disabled={isGenerating}
                    className="h-10 cursor-pointer rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Apply changes
                </Button>
                <Button
                    variant="outline"
                    onClick={onKeepChatting}
                    disabled={isGenerating}
                    className="h-10 cursor-pointer rounded-full border-zinc-200 bg-zinc-100 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                    Keep chatting
                </Button>
            </div>
        </div>
    </div>
);

const PlanEyebrow = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-orange-700/80 dark:text-orange-300/80">
        <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)] dark:bg-orange-500 dark:shadow-[0_0_14px_rgba(194,65,12,0.75)]" />
        {label}
    </div>
);

const PlanStep = ({ plan }: { plan: SectionPlan }) => (
    <div className="rounded-xl border border-orange-300/40 bg-background/70 px-3 py-2 dark:border-white/10 dark:bg-zinc-900/80">
        <div className="flex flex-wrap items-center gap-2 text-xs text-orange-700 dark:text-orange-200/90">
            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-200">
                {plan.action}
            </span>
            <span className="text-muted-foreground dark:text-orange-100/65">
                {plan.sectionKey}
            </span>
            {(plan.action === "modify" || plan.action === "add") && (
                <span className="rounded-full border border-orange-400/40 px-2 py-0.5 text-orange-700 dark:border-orange-500/25 dark:text-orange-100">
                    {plan.intensity}
                </span>
            )}
        </div>
        <div className="mt-2 text-sm text-foreground dark:text-orange-50">
            {plan.instruction}
        </div>
        {plan.rationale && (
            <div className="mt-1 text-xs text-muted-foreground dark:text-orange-100/55">
                {plan.rationale}
            </div>
        )}
    </div>
);
