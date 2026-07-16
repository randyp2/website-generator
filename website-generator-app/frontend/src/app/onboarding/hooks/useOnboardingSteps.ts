"use client";

import { useCallback, useMemo, useState } from "react";

import { ONBOARDING_STEPS } from "../constants";

export const useOnboardingSteps = (initialStep: number = 0) => {
    const [step, setStep] = useState(initialStep);
    const lastStep = ONBOARDING_STEPS.length - 1;

    const goBack = useCallback(() => {
        setStep((current) => Math.max(0, current - 1));
    }, []);

    const goNext = useCallback(() => {
        setStep((current) => Math.min(lastStep, current + 1));
    }, [lastStep]);

    // Only allow jumping backwards to already-completed steps.
    const jumpTo = useCallback(
        (target: number) => {
            setStep((current) => (target < current ? target : current));
        },
        [],
    );

    return useMemo(
        () => ({
            step,
            steps: ONBOARDING_STEPS,
            activeStep: ONBOARDING_STEPS[step],
            isLastStep: step === lastStep,
            goBack,
            goNext,
            jumpTo,
        }),
        [step, lastStep, goBack, goNext, jumpTo],
    );
};
