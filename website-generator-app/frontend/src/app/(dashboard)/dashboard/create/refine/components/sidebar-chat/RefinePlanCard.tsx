"use client";

import { Button } from "@/components/ui/button";
import type { SectionPlan } from "@/types/preview";

interface RefinePlanCardProps {
    summary?: string;
    plans: SectionPlan[];
}

export const RefinePlanCard: React.FC<RefinePlanCardProps> = ({
    summary,
    plans,
}) => (
    <div className="rounded-2xl border border-orange-400/30 bg-orange-50/80 px-4 py-3 shadow-[0_18px_48px_rgba(249,115,22,0.12)] dark:bg-gradient-to-br dark:from-orange-500/10 dark:via-amber-500/5 dark:to-black/40 dark:shadow-[0_0_30px_rgba(249,115,22,0.25)]">
        <PlanEyebrow label="Plan ready" />
        {summary && (
            <div className="mt-2 text-sm text-foreground dark:text-white">
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

export const PlanApprovalBar: React.FC<PlanApprovalBarProps> = ({
    isGenerating,
    onApprovePlan,
    onKeepChatting,
}) => (
    <div className="border-t border-border px-4 py-3 dark:border-white/10">
        <div className="flex flex-col gap-3 rounded-2xl border border-orange-400/30 bg-orange-50/80 px-4 py-3 shadow-[0_18px_48px_rgba(249,115,22,0.12)] dark:bg-gradient-to-br dark:from-orange-500/10 dark:via-amber-500/5 dark:to-black/40 dark:shadow-[0_0_30px_rgba(249,115,22,0.25)]">
            <PlanEyebrow label="Approve plan" />
            <div className="text-sm text-foreground/90 dark:text-white/90">
                Review the planned changes, then apply or keep refining.
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    onClick={onApprovePlan}
                    disabled={isGenerating}
                    className="rounded-xl bg-orange-500/90 text-white shadow-[0_0_18px_rgba(249,115,22,0.35)] hover:bg-orange-500"
                >
                    Apply changes
                </Button>
                <Button
                    variant="ghost"
                    onClick={onKeepChatting}
                    disabled={isGenerating}
                    className="rounded-xl text-orange-700 hover:bg-orange-500/10 dark:text-orange-100/70"
                >
                    Keep chatting
                </Button>
            </div>
        </div>
    </div>
);

const PlanEyebrow = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-orange-700/80 dark:text-orange-300/80">
        <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]" />
        {label}
    </div>
);

const PlanStep = ({ plan }: { plan: SectionPlan }) => (
    <div className="rounded-xl border border-orange-300/40 bg-background/70 px-3 py-2 dark:border-orange-200/10 dark:bg-black/30">
        <div className="flex flex-wrap items-center gap-2 text-xs text-orange-700 dark:text-orange-200/90">
            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-700 dark:text-orange-200">
                {plan.action}
            </span>
            <span className="text-muted-foreground dark:text-white/70">
                {plan.sectionKey}
            </span>
            {(plan.action === "modify" || plan.action === "add") && (
                <span className="rounded-full border border-orange-400/40 px-2 py-0.5 text-orange-700 dark:text-orange-100">
                    {plan.intensity}
                </span>
            )}
        </div>
        <div className="mt-2 text-sm text-foreground/90 dark:text-white/90">
            {plan.instruction}
        </div>
        {plan.rationale && (
            <div className="mt-1 text-xs text-muted-foreground dark:text-white/50">
                {plan.rationale}
            </div>
        )}
    </div>
);
