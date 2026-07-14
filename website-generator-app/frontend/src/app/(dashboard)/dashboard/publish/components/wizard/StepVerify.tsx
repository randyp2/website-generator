"use client";

import { useState } from "react";
import { FiCheck, FiClock, FiCopy, FiShield } from "react-icons/fi";

import { Button } from "@/components/ui/button";

import type { SiteOwnershipChallenge } from "../../lib/siteOwnershipVerification";

interface StepVerifyProps {
    challenge: SiteOwnershipChallenge;
}

export const StepVerify = ({ challenge }: StepVerifyProps) => {
    const [copied, setCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);
    const verified = challenge.status === "VERIFIED";

    const copyTag = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(challenge.verificationTag);
            setCopyFailed(false);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopyFailed(true);
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm font-medium text-foreground">
                    Verify website ownership
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Prove that you can edit {challenge.canonicalOrigin} before it is
                    published on your profile.
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                        {verified ? (
                            <FiCheck className="size-4" />
                        ) : (
                            <FiShield className="size-4" />
                        )}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            {verified ? "Ownership verified" : "Add the verification tag"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Place this tag inside the {"<head>"} of the page at{" "}
                            {challenge.verificationUrl}, then deploy your changes.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-background p-3">
                    <code className="min-w-0 flex-1 break-all text-xs leading-5 text-foreground">
                        {challenge.verificationTag}
                    </code>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void copyTag()}
                        className="shrink-0 gap-2"
                    >
                        {copied ? <FiCheck className="size-3.5" /> : <FiCopy className="size-3.5" />}
                        {copied ? "Copied" : "Copy"}
                    </Button>
                </div>
                {copyFailed && (
                    <p className="mt-2 text-xs text-red-400">
                        Copy failed. Select and copy the tag manually.
                    </p>
                )}
            </div>

            {!verified && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200">
                    <FiClock className="mt-0.5 size-3.5 shrink-0" />
                    <p>
                        Verification is pending. Install the tag and keep it in place
                        before continuing.
                    </p>
                </div>
            )}
        </div>
    );
};
