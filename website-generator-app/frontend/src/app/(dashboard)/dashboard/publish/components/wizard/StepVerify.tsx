"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiClock, FiCopy } from "react-icons/fi";

import type { SiteOwnershipChallenge } from "../../lib/siteOwnershipVerification";
import {
    makePortableVerificationTag,
    type SiteVerificationFramework,
} from "../../lib/siteVerificationFrameworks";
import {
    SiteVerificationCodeBlock,
    SiteVerificationFrameworkPicker,
} from "./SiteVerificationInstallGuide";
import { HighlightedCode } from "./CodeHighlight";
import { StepConnector } from "./StepConnector";
import { StepMarker } from "./StepMarker";

interface StepVerifyProps {
    challenge: SiteOwnershipChallenge;
}

export const StepVerify = ({ challenge }: StepVerifyProps) => {
    const [copied, setCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);
    const [framework, setFramework] =
        useState<SiteVerificationFramework>("html");
    const copyFeedbackTimeout = useRef<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const tagRef = useRef<HTMLDivElement>(null);
    const codeRef = useRef<HTMLDivElement>(null);
    const verified = challenge.status === "VERIFIED";
    const portableTag = makePortableVerificationTag(challenge.verificationTag);

    useEffect(
        () => () => {
            if (copyFeedbackTimeout.current) {
                window.clearTimeout(copyFeedbackTimeout.current);
            }
        },
        [],
    );

    const copyTag = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(portableTag);
            setCopyFailed(false);
            setCopied(true);
            if (copyFeedbackTimeout.current) {
                window.clearTimeout(copyFeedbackTimeout.current);
            }
            copyFeedbackTimeout.current = window.setTimeout(
                () => setCopied(false),
                2000,
            );
        } catch {
            setCopyFailed(true);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-medium text-foreground">
                    Verify website ownership
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Add a verification tag to {challenge.canonicalOrigin}, then
                    deploy your changes.
                </p>
            </div>

            {/* Diagonal flow: content boxes run top-left -> bottom-right, and each
                step's description sits on the opposite side of its box. */}
            <div
                ref={gridRef}
                className="relative grid gap-x-6 gap-y-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center"
            >
                {/* Step 1 marker (desktop: top-right, reading toward the tag box) */}
                <StepMarker
                    number={1}
                    align="right"
                    title="Copy your verification tag"
                    description="This tag is unique to your website verification request."
                    className="md:col-start-2 md:row-start-1"
                />

                {/* Meta tag box (desktop: top-left) */}
                <section className="rounded-xl bg-card/60 p-4 md:col-start-1 md:row-start-1">
                    <div
                        ref={tagRef}
                        className="flex items-start gap-3 rounded-lg border border-border bg-muted px-3 py-3"
                    >
                        <code className="min-w-0 flex-1 break-all text-xs leading-5">
                            <HighlightedCode line={portableTag} />
                        </code>
                        <button
                            type="button"
                            onClick={() => void copyTag()}
                            aria-label={
                                copied
                                    ? "Verification tag copied"
                                    : "Copy verification tag"
                            }
                            title={copied ? "Copied" : "Copy verification tag"}
                            className="shrink-0 cursor-pointer border-0 bg-transparent p-1 text-muted-foreground transition-colors hover:text-foreground active:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            {copied ? (
                                <FiCheck className="size-4 text-emerald-500" />
                            ) : (
                                <FiCopy className="size-4" />
                            )}
                        </button>
                    </div>
                    <span className="sr-only" aria-live="polite">
                        {copied ? "Verification tag copied" : ""}
                    </span>
                    {copyFailed && (
                        <p className="mt-2 text-xs text-destructive">
                            Copy failed. Select and copy the tag manually.
                        </p>
                    )}
                </section>

                {/* Step 2 marker (desktop: bottom-left, reading toward the code block) */}
                <StepMarker
                    number={2}
                    align="left"
                    title="Add it inside your head tag"
                    description="Choose your framework to find the correct file."
                    className="md:col-start-1 md:row-start-2"
                >
                    <SiteVerificationFrameworkPicker
                        framework={framework}
                        onFrameworkChange={setFramework}
                    />
                </StepMarker>

                {/* Code block (desktop: bottom-right) */}
                <div ref={codeRef} className="md:col-start-2 md:row-start-2">
                    <SiteVerificationCodeBlock
                        framework={framework}
                        verificationTag={portableTag}
                    />
                </div>

                <StepConnector
                    containerRef={gridRef}
                    sourceRef={tagRef}
                    targetRef={codeRef}
                />
            </div>

            {!verified && (
                <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-300">
                    <FiClock className="mt-0.5 size-3.5 shrink-0" />
                    <p>
                        Verification is pending until the deployed page contains the
                        tag.
                    </p>
                </div>
            )}
        </div>
    );
};
