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

interface StepVerifyProps {
    challenge: SiteOwnershipChallenge;
    error: string | null;
}

export const StepVerify = ({ challenge, error }: StepVerifyProps) => {
    const [copied, setCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);
    const [framework, setFramework] =
        useState<SiteVerificationFramework>("html");
    const copyFeedbackTimeout = useRef<number | null>(null);
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
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-foreground">
                        Verify website ownership
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Add a verification tag to {challenge.canonicalOrigin}, then
                        deploy your changes.
                    </p>
                </div>
                {verified && (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-400">
                        <FiCheck className="size-3.5" />
                        Verified
                    </span>
                )}
            </div>

            {/* Diagonal flow: content boxes run top-left -> bottom-right, and each
                step's description sits on the opposite side of its box. */}
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center">
                {/* Top-left: copy the tag */}
                <section className="rounded-xl bg-card/60 p-4">
                    <div className="flex items-start gap-3 rounded-lg bg-[#0d1117] px-3 py-3">
                        <code className="min-w-0 flex-1 break-all text-xs leading-5 text-[#a5d6ff]">
                            {portableTag}
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
                            className="shrink-0 cursor-pointer border-0 bg-transparent p-1 text-slate-400 transition-colors hover:text-white active:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            {copied ? (
                                <FiCheck className="size-4 text-emerald-400" />
                            ) : (
                                <FiCopy className="size-4" />
                            )}
                        </button>
                    </div>
                    <span className="sr-only" aria-live="polite">
                        {copied ? "Verification tag copied" : ""}
                    </span>
                    {copyFailed && (
                        <p className="mt-2 text-xs text-red-400">
                            Copy failed. Select and copy the tag manually.
                        </p>
                    )}
                </section>

                {/* Top-right: step 1 description, reading back toward the tag box */}
                <div className="flex items-center gap-3 md:flex-row-reverse md:text-right">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        1
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                            Copy your verification tag
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            This tag is unique to your website verification
                            request.
                        </p>
                    </div>
                </div>

                {/* Bottom-left: step 2 description, reading toward the code block */}
                <SiteVerificationFrameworkPicker
                    framework={framework}
                    onFrameworkChange={setFramework}
                />

                {/* Bottom-right: the code block */}
                <SiteVerificationCodeBlock
                    framework={framework}
                    verificationTag={portableTag}
                />
            </div>

            {!verified && (
                <div className="flex items-start gap-2 text-xs text-amber-300">
                    <FiClock className="mt-0.5 size-3.5 shrink-0" />
                    <p>
                        Verification is pending until the deployed page contains the
                        tag.
                    </p>
                </div>
            )}
            {error && (
                <p className="text-xs text-red-400" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};
