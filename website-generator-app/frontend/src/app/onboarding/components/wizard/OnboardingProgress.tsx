"use client";

import { cn } from "@/lib/utils";

import { ONBOARDING_STEPS } from "../../constants";

type OnboardingProgressProps = {
    step: number;
    onJumpTo: (target: number) => void;
};

export const OnboardingProgress = ({
    step,
    onJumpTo,
}: OnboardingProgressProps) => (
    <div className="space-y-2.5">
        <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Step {step + 1} of {ONBOARDING_STEPS.length}
            </p>
            <p className="text-xs text-muted-foreground">
                {ONBOARDING_STEPS[step].title}
            </p>
        </div>
        <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((current, index) => (
                <button
                    key={current.key}
                    type="button"
                    aria-label={`Go to step ${index + 1}: ${current.title}`}
                    onClick={() => index < step && onJumpTo(index)}
                    disabled={index > step}
                    className={cn(
                        "h-2 flex-1 rounded-full transition-all duration-300",
                        index < step &&
                            "cursor-pointer bg-primary/70 hover:bg-primary",
                        index === step && "bg-primary",
                        index > step && "cursor-default bg-muted",
                    )}
                />
            ))}
        </div>
    </div>
);
