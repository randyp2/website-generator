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
    <div className="flex items-end gap-2">
        {ONBOARDING_STEPS.map((current, index) => {
            const isFilled = index <= step;
            return (
                <button
                    key={current.key}
                    type="button"
                    aria-label={`Go to step ${index + 1}: ${current.title}`}
                    aria-current={index === step ? "step" : undefined}
                    onClick={() => index < step && onJumpTo(index)}
                    disabled={index > step}
                    className={cn(
                        "group flex flex-1 flex-col gap-1.5 text-left",
                        index < step && "cursor-pointer",
                        index >= step && "cursor-default",
                    )}
                >
                    <span
                        className={cn(
                            "text-xs font-medium transition-colors",
                            index === step
                                ? "text-foreground"
                                : "text-muted-foreground",
                            index < step && "group-hover:text-foreground",
                        )}
                    >
                        {current.title}
                    </span>
                    <span className="relative h-2 overflow-hidden rounded-full bg-muted">
                        <motion.span
                            initial={false}
                            animate={{ scaleX: isFilled ? 1 : 0 }}
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                            className="absolute inset-0 origin-left rounded-full bg-primary"
                        />
                    </span>
                </button>
            );
        })}
    </div>
);
