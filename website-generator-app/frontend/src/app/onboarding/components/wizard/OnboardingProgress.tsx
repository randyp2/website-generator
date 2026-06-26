"use client";

import { motion } from "framer-motion";

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
            {ONBOARDING_STEPS.map((current, index) => {
                const isFilled = index <= step;
                return (
                    <button
                        key={current.key}
                        type="button"
                        aria-label={`Go to step ${index + 1}: ${current.title}`}
                        onClick={() => index < step && onJumpTo(index)}
                        disabled={index > step}
                        className={cn(
                            "relative h-2 flex-1 overflow-hidden rounded-full bg-muted",
                            index < step && "cursor-pointer",
                            index >= step && "cursor-default",
                        )}
                    >
                        <motion.span
                            initial={false}
                            animate={{ scaleX: isFilled ? 1 : 0 }}
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                            className="absolute inset-0 origin-left rounded-full bg-primary"
                        />
                    </button>
                );
            })}
        </div>
    </div>
);
