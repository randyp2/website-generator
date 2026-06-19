"use client";

import { cn } from "@/lib/utils";
import type { NormalizedAgentUiHints } from "@/lib/agent-ui-hints";
import { FileText, MessageSquareText, UploadCloud } from "lucide-react";

interface AgentResumeUploadPromptProps {
    uiHints: NormalizedAgentUiHints;
    className?: string;
}

const blockedOnLabel: Record<NonNullable<NormalizedAgentUiHints["blockedOn"]>, string> = {
    resume_or_manual_context: "Waiting on resume or manual context",
    content_foundation: "Waiting on content foundation",
    style_selection: "Waiting on style selection",
};

export function AgentResumeUploadPrompt({
    uiHints,
    className,
}: AgentResumeUploadPromptProps) {
    const isManualContextRequested = uiHints.requestedManualContext;
    const title = isManualContextRequested
        ? "No resume? Add context in chat"
        : "Resume requested";
    const description = isManualContextRequested
        ? "Answer the agent's next questions so it can build a content foundation before styling."
        : "The agent wants a resume before moving into design. Upload wiring is intentionally disabled for now.";

    return (
        <section
            className={cn(
                "overflow-hidden rounded-3xl border border-orange-300/25 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.20),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)]",
                className,
            )}
            aria-label={title}
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200/25 bg-orange-300/15 text-orange-100">
                    {isManualContextRequested ? (
                        <MessageSquareText className="h-5 w-5" />
                    ) : (
                        <FileText className="h-5 w-5" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">
                            {title}
                        </h3>
                        {uiHints.blockedOn && (
                            <span className="rounded-full border border-white/10 bg-white/[0.07] px-2 py-0.5 text-[11px] text-white/55">
                                {blockedOnLabel[uiHints.blockedOn]}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-white/65">
                        {description}
                    </p>
                </div>
            </div>

            {!isManualContextRequested && (
                <div
                    className="mt-4 rounded-2xl border border-dashed border-white/18 bg-black/20 px-4 py-5 text-center"
                    aria-disabled="true"
                >
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        disabled
                        className="sr-only"
                        tabIndex={-1}
                    />
                    <UploadCloud className="mx-auto h-6 w-6 text-white/45" />
                    <p className="mt-2 text-sm font-medium text-white/82">
                        Drop resume here, or browse
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                        Preview only. Upload handling will be wired in the next step.
                    </p>
                </div>
            )}
        </section>
    );
}
