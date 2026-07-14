"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiGlobe, FiX } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { buildPortfolioUrl } from "@/lib/public-env";
import type { Portfolio } from "@/types/portfolio";

import { useSiteOwnershipChallenge } from "../hooks/useSiteOwnershipChallenge";
import { StepIndicator, type WizardStepDef } from "./wizard/StepIndicator";
import { StepPick, type PublishSource } from "./wizard/StepPick";
import { StepSlug } from "./wizard/StepSlug";
import { StepDetails } from "./wizard/StepDetails";
import { StepPreview } from "./wizard/StepPreview";
import { StepPublish, type PublishActionState } from "./wizard/StepPublish";
import { StepVerify } from "./wizard/StepVerify";

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;
const URL_REGEX = /^https:\/\/[^\s/$.?#].[^\s]*$/i;

const GENERATED_STEPS: WizardStepDef[] = [
    { key: "pick", label: "Pick" },
    { key: "slug", label: "Slug" },
    { key: "details", label: "Details" },
    { key: "preview", label: "Preview" },
    { key: "publish", label: "Publish" },
];

const EXTERNAL_STEPS: WizardStepDef[] = [
    { key: "pick", label: "Pick" },
    { key: "verify", label: "Verify" },
    { key: "slug", label: "Slug" },
    { key: "details", label: "Details" },
    { key: "preview", label: "Preview" },
    { key: "publish", label: "Publish" },
];

interface PublishWizardModalProps {
    drafts: Portfolio[];
    ownerName: string;
    ownerAvatarUrl: string | null;
    initialPortfolioId?: string | null;
    onClose: () => void;
    onPublished: (
        portfolioId: string,
        slug: string,
        description: string,
    ) => void;
}

export const PublishWizardModal = ({
    drafts,
    ownerName,
    ownerAvatarUrl,
    initialPortfolioId = null,
    onClose,
    onPublished,
}: PublishWizardModalProps) => {
    // When a specific draft is preselected (e.g. the user clicked a draft card),
    // step 1 ("Pick") is already complete, so open the wizard on step 2 ("Slug").
    const initialDraft = initialPortfolioId
        ? drafts.find((p) => String(p.id) === initialPortfolioId) ?? null
        : null;

    const [currentStep, setCurrentStep] = useState(initialDraft ? 1 : 0);
    const [direction, setDirection] = useState(1);
    const [source, setSource] = useState<PublishSource>("generated");
    const [externalUrl, setExternalUrl] = useState("");
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<
        string | null
    >(initialDraft ? String(initialDraft.id) : null);
    const [slugInput, setSlugInput] = useState(initialDraft?.slug ?? "");
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [slugChecking, setSlugChecking] = useState(false);
    const [descriptionInput, setDescriptionInput] = useState(
        initialDraft?.description ?? "",
    );
    const [publishState, setPublishState] =
        useState<PublishActionState>("idle");
    const [publishError, setPublishError] = useState<string | null>(null);
    const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const slugCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const siteChallenge = useSiteOwnershipChallenge();

    const selectedPortfolio = useMemo(
        () => drafts.find((p) => String(p.id) === selectedPortfolioId) ?? null,
        [drafts, selectedPortfolioId],
    );

    const slugIsValid = slugInput.length >= 3 && SLUG_REGEX.test(slugInput);
    const externalUrlReady = URL_REGEX.test(externalUrl.trim());
    const isUnchanged = Boolean(
        selectedPortfolio?.slug && selectedPortfolio.slug === slugInput,
    );
    const slugReady = slugIsValid && (slugAvailable === true || isUnchanged);
    const steps = source === "external" ? EXTERNAL_STEPS : GENERATED_STEPS;
    const currentStepKey = steps[currentStep]?.key ?? "pick";

    const canAdvance = (() => {
        switch (currentStepKey) {
            case "pick":
                return source === "generated"
                    ? Boolean(selectedPortfolioId)
                    : externalUrlReady && siteChallenge.status !== "loading";
            case "verify":
                return siteChallenge.challenge?.status === "VERIFIED";
            case "slug":
                return slugReady;
            case "details":
            case "preview":
                return true;
            default:
                return false;
        }
    })();

    const checkSlugAvailability = useCallback((value: string) => {
        if (slugCheckTimeout.current) clearTimeout(slugCheckTimeout.current);
        if (!value || !SLUG_REGEX.test(value)) {
            setSlugAvailable(null);
            return;
        }
        setSlugChecking(true);
        slugCheckTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/portfolio/slug-check?slug=${encodeURIComponent(value)}`,
                );
                const data = await res.json();
                setSlugAvailable(data.available);
            } catch {
                setSlugAvailable(null);
            } finally {
                setSlugChecking(false);
            }
        }, 400);
    }, []);

    const handleSlugChange = (value: string) => {
        setSlugInput(value);
        setPublishError(null);
        if (selectedPortfolio?.slug && value === selectedPortfolio.slug) {
            setSlugAvailable(null);
            return;
        }
        checkSlugAvailability(value);
    };

    const handleSelectPortfolio = (portfolioId: string) => {
        setSource("generated");
        siteChallenge.reset();
        setSelectedPortfolioId(portfolioId);
        const next = drafts.find((p) => String(p.id) === portfolioId);
        setDescriptionInput(next?.description ?? "");
        if (next?.slug) {
            setSlugInput(next.slug);
            setSlugAvailable(null);
            return;
        }
        setSlugInput("");
        setSlugAvailable(null);
    };

    const handleSourceChange = (nextSource: PublishSource) => {
        setSource(nextSource);
        setPublishError(null);
        siteChallenge.reset();
        if (nextSource === "generated") {
            return;
        }
        setSelectedPortfolioId(null);
        setDescriptionInput("");
        setSlugInput("");
        setSlugAvailable(null);
    };

    const handleExternalUrlChange = (value: string) => {
        setExternalUrl(value);
        setPublishError(null);
        siteChallenge.reset();
    };

    const goNext = async () => {
        if (!canAdvance) return;
        if (currentStepKey === "pick" && source === "external") {
            const challenge = await siteChallenge.createChallenge(externalUrl);
            if (!challenge) return;
        }
        setDirection(1);
        setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    };

    const goBack = () => {
        if (currentStep === 0) return;
        setDirection(-1);
        setCurrentStep((s) => Math.max(s - 1, 0));
    };

    const jumpTo = (step: number) => {
        if (step >= currentStep) return;
        setDirection(-1);
        setCurrentStep(step);
    };

    const handlePublish = async () => {
        const isExternalSource = source === "external";
        if (isExternalSource && !externalUrlReady) {
            setPublishState("error");
            setPublishError("Please provide a valid external URL.");
            return;
        }
        if (
            isExternalSource &&
            siteChallenge.challenge?.status !== "VERIFIED"
        ) {
            setPublishState("error");
            setPublishError("Website ownership verification is required.");
            return;
        }

        setPublishState("loading");
        setPublishError(null);
        try {
            let payload:
                | {
                      sourceType: "EXTERNAL";
                      externalUrl: string;
                      slug: string | null;
                      description: string;
                  }
                | {
                      portfolioId: string;
                      sourceType: "GENERATED";
                      slug: string | null;
                      description: string;
                  };

            if (isExternalSource) {
                payload = {
                    sourceType: "EXTERNAL",
                    externalUrl: externalUrl.trim(),
                    slug: slugInput || null,
                    description: descriptionInput,
                };
            } else {
                if (!selectedPortfolio) return;
                payload = {
                    portfolioId: String(selectedPortfolio.id),
                    sourceType: "GENERATED",
                    slug: slugInput || null,
                    description: descriptionInput,
                };
            }

            const res = await fetch(`/api/portfolio/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res
                    .json()
                    .catch(() => ({ error: "Publish failed" }));
                throw new Error(err.error || "Publish failed");
            }
            const data = await res.json();
            const responseSlug =
                typeof data?.slug === "string" ? data.slug : null;
            const responsePortfolioId =
                typeof data?.portfolioId === "string"
                    ? data.portfolioId
                    : selectedPortfolio
                      ? String(selectedPortfolio.id)
                      : null;

            if (!responseSlug || !responsePortfolioId) {
                throw new Error("Publish response missing required fields.");
            }

            setPublishedSlug(responseSlug);
            setPublishState("success");
            onPublished(responsePortfolioId, responseSlug, descriptionInput);
            setTimeout(() => {
                onClose();
            }, 1800);
        } catch (err: unknown) {
            setPublishError(
                err instanceof Error ? err.message : "Publish failed",
            );
            setPublishState("error");
        }
    };

    const handleCopyUrl = async () => {
        if (!publishedSlug) return;
        const trimmedExternalUrl = externalUrl.trim();
        const urlToCopy =
            source === "external" && trimmedExternalUrl
                ? trimmedExternalUrl
                : buildPortfolioUrl(publishedSlug, ownerName);
        await navigator.clipboard.writeText(urlToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isLastStep = currentStep === steps.length - 1;
    const isPublishLocked =
        publishState === "loading" || publishState === "success";
    const isChallengeLoading = siteChallenge.status === "loading";
    const nextButtonLabel = isChallengeLoading
        ? "Creating tag..."
        : currentStepKey === "verify" && !canAdvance
          ? "Awaiting verification"
          : "Next";
    const selectedLabel = selectedPortfolio
        ? selectedPortfolio.title
        : source === "external" && externalUrl.trim()
          ? externalUrl.trim()
          : "";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-border px-8 py-5">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                Publish portfolio
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Step {currentStep + 1} of {steps.length}
                                {selectedLabel ? ` · ${selectedLabel}` : ""}
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            size="icon"
                            aria-label="Close"
                        >
                            <FiX className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Step indicator */}
                    <div className="border-b border-border px-8 py-5">
                        <StepIndicator
                            steps={steps}
                            currentStep={currentStep}
                            onJumpTo={jumpTo}
                        />
                    </div>

                    {/* Step body */}
                    <div className="relative flex min-h-[360px] px-8 py-6">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentStepKey}
                                custom={direction}
                                initial={{ opacity: 0, x: direction * 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction * -24 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="w-full"
                            >
                                {currentStepKey === "pick" && (
                                    <div>
                                        <StepPick
                                            drafts={drafts}
                                            source={source}
                                            externalUrl={externalUrl}
                                            selectedPortfolioId={
                                                selectedPortfolioId
                                            }
                                            onExternalUrlChange={
                                                handleExternalUrlChange
                                            }
                                            onSelect={handleSelectPortfolio}
                                            onSourceChange={handleSourceChange}
                                        />
                                        {siteChallenge.error && (
                                            <p className="mt-3 text-xs text-red-400">
                                                {siteChallenge.error}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {currentStepKey === "verify" &&
                                    siteChallenge.challenge && (
                                        <StepVerify
                                            challenge={siteChallenge.challenge}
                                        />
                                    )}
                                {currentStepKey === "slug" && (
                                    <StepSlug
                                        ownerName={ownerName}
                                        slugInput={slugInput}
                                        slugIsValid={slugIsValid}
                                        slugAvailable={slugAvailable}
                                        slugChecking={slugChecking}
                                        isUnchanged={isUnchanged}
                                        onChange={handleSlugChange}
                                    />
                                )}
                                {currentStepKey === "details" && (
                                    <StepDetails
                                        descriptionInput={descriptionInput}
                                        onChange={setDescriptionInput}
                                    />
                                )}
                                {currentStepKey === "preview" && (
                                    <StepPreview
                                        source={source}
                                        externalUrl={externalUrl}
                                        portfolio={selectedPortfolio}
                                        slug={slugInput}
                                        description={descriptionInput}
                                        ownerName={ownerName}
                                        ownerAvatarUrl={ownerAvatarUrl}
                                    />
                                )}
                                {currentStepKey === "publish" && (
                                    <StepPublish
                                        source={source}
                                        state={publishState}
                                        error={publishError}
                                        slug={slugInput}
                                        externalUrl={externalUrl}
                                        ownerName={ownerName}
                                        publishedSlug={publishedSlug}
                                        onCopyUrl={handleCopyUrl}
                                        copied={copied}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 border-t border-border bg-background/40 px-8 py-5">
                        <Button
                            type="button"
                            onClick={goBack}
                            disabled={currentStep === 0 || isPublishLocked}
                            variant="outline"
                            className="gap-2"
                        >
                            <FiArrowLeft className="h-4 w-4" />
                            Back
                        </Button>

                        {!isLastStep ? (
                            <Button
                                type="button"
                                onClick={() => void goNext()}
                                disabled={!canAdvance || isChallengeLoading}
                                className="gap-2"
                            >
                                {nextButtonLabel}
                                {!isChallengeLoading && currentStepKey !== "verify" && (
                                    <FiArrowRight className="h-4 w-4" />
                                )}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handlePublish}
                                disabled={isPublishLocked}
                                className="gap-2"
                            >
                                <FiGlobe className="h-4 w-4" />
                                {publishState === "success"
                                      ? "Published"
                                      : publishState === "loading"
                                      ? "Publishing..."
                                      : "Publish"}
                            </Button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
