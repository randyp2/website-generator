"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, type ChangeEvent, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useOnboardingSteps } from "../hooks/useOnboardingSteps";
import { type FormState, type UsernameState } from "../types";
import OnboardingShell from "./OnboardingShell";
import { OnboardingProgress } from "./wizard/OnboardingProgress";
import { StepBackground } from "./wizard/StepBackground";
import { StepBasics } from "./wizard/StepBasics";
import { StepLinksBio } from "./wizard/StepLinksBio";

type OnboardingFormCardProps = {
    form: FormState;
    usernameState: UsernameState;
    usernameHelper: string;
    usernamePreview: string;
    siteHost: string;
    initialStep: number;
    bioLength: number;
    submitError: string | null;
    isSubmitting: boolean;
    canSubmit: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onFieldChange: (
        field: keyof FormState,
    ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onUsernameChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onDraftChange: (form: FormState, step: number) => void;
};

const OnboardingFormCard = ({
    form,
    usernameState,
    usernameHelper,
    usernamePreview,
    siteHost,
    initialStep,
    bioLength,
    submitError,
    isSubmitting,
    canSubmit,
    onSubmit,
    onFieldChange,
    onUsernameChange,
    onDraftChange,
}: OnboardingFormCardProps) => {
    const { step, activeStep, isLastStep, goBack, goNext, jumpTo } =
        useOnboardingSteps(initialStep);

    useEffect(() => {
        onDraftChange(form, step);
    }, [form, onDraftChange, step]);

    // Username must resolve before leaving the first step.
    const canLeaveStep =
        step === 0 ? usernameState.status === "available" : true;

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isLastStep) {
            if (canLeaveStep) goNext();
            return;
        }
        onSubmit(event);
    };

    return (
        <OnboardingShell containerClassName="flex items-center justify-center px-4 py-6 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mx-auto w-full max-w-2xl"
            >
                <Card className="border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
                    <CardContent className="p-6 sm:p-8">
                        <OnboardingProgress step={step} onJumpTo={jumpTo} />

                        <div className="mb-5 mt-6">
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                {step === 0
                                    ? "Let's shape your profile"
                                    : activeStep.title}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {activeStep.description}
                            </p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeOut",
                                    }}
                                >
                                    {step === 0 && (
                                        <StepBasics
                                            form={form}
                                            usernameState={usernameState}
                                            usernameHelper={usernameHelper}
                                            usernamePreview={usernamePreview}
                                            siteHost={siteHost}
                                            onFieldChange={onFieldChange}
                                            onUsernameChange={onUsernameChange}
                                        />
                                    )}
                                    {step === 1 && (
                                        <StepBackground
                                            form={form}
                                            onFieldChange={onFieldChange}
                                        />
                                    )}
                                    {step === 2 && (
                                        <StepLinksBio
                                            form={form}
                                            bioLength={bioLength}
                                            onFieldChange={onFieldChange}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {submitError && (
                                <p className="text-sm text-destructive">
                                    {submitError}
                                </p>
                            )}

                            <div className="flex items-center justify-between gap-3 pt-1">
                                {step > 0 ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={goBack}
                                        className="group h-11 gap-2 hover:cursor-pointer hover:bg-transparent"
                                    >
                                        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                                        Back
                                    </Button>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        You can edit all of this later.
                                    </span>
                                )}

                                {isLastStep ? (
                                    <Button
                                        type="submit"
                                        disabled={!canSubmit}
                                        className="h-11 min-w-40 text-base hover:cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </span>
                                        ) : (
                                            "Finish"
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={!canLeaveStep}
                                        className="group h-11 min-w-32 gap-2 text-base hover:cursor-pointer hover:bg-primary"
                                    >
                                        Continue
                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                    </Button>
                                )}
                            </div>

                            <p aria-live="polite" className="sr-only">
                                {usernameHelper}
                            </p>
                            <p aria-live="polite" className="sr-only">
                                {submitError ??
                                    (isSubmitting
                                        ? "Saving profile changes..."
                                        : "")}
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </OnboardingShell>
    );
};

export default OnboardingFormCard;
