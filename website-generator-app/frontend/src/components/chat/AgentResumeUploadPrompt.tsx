"use client";

import { cn } from "@/lib/utils";
import type { NormalizedAgentUiHints } from "@/lib/agent-ui-hints";
import {
    AlertCircle,
    CheckCircle2,
    FileText,
    Loader2,
    MessageSquareText,
    UploadCloud,
} from "lucide-react";
import {
    useCallback,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
} from "react";

interface AgentResumeUploadPromptProps {
    uiHints: NormalizedAgentUiHints;
    isProcessing?: boolean;
    errorMessage?: string | null;
    selectedFileName?: string | null;
    onResumeFileSelected?: (file: File) => void | Promise<void>;
    className?: string;
}

const ACCEPTED_RESUME_EXTENSIONS = [".pdf"] as const;
const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const blockedOnLabel: Record<NonNullable<NormalizedAgentUiHints["blockedOn"]>, string> = {
    resume_or_manual_context: "Waiting on resume or manual context",
    content_foundation: "Waiting on content foundation",
    style_selection: "Waiting on style selection",
};

const formatAcceptedExtensions = (): string =>
    ACCEPTED_RESUME_EXTENSIONS.join(",");

const isAcceptedResumeFile = (file: File): boolean => {
    const lowerName = file.name.toLowerCase();
    return ACCEPTED_RESUME_EXTENSIONS.some((extension) =>
        lowerName.endsWith(extension),
    );
};

export function AgentResumeUploadPrompt({
    uiHints,
    isProcessing = false,
    errorMessage,
    selectedFileName,
    onResumeFileSelected,
    className,
}: AgentResumeUploadPromptProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const isManualContextRequested = uiHints.requestedManualContext;
    const isUploadEnabled = Boolean(onResumeFileSelected) && !isProcessing;
    const visibleError = validationError ?? errorMessage;
    const title = isManualContextRequested
        ? "No resume? Add context in chat"
        : "Resume requested";
    const description = isManualContextRequested
        ? "Answer the agent's next questions so it can build a content foundation before styling."
        : "Upload a PDF resume and the agent will parse it before moving into design.";

    const processFile = useCallback(
        (file?: File) => {
            if (!file || !isUploadEnabled) {
                return;
            }
            if (!isAcceptedResumeFile(file)) {
                setValidationError("Upload a PDF resume for this flow.");
                return;
            }
            if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
                setValidationError("Resume must be 5MB or smaller.");
                return;
            }

            setValidationError(null);
            void onResumeFileSelected?.(file);
        },
        [isUploadEnabled, onResumeFileSelected],
    );

    const handleDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragOver(false);
            processFile(event.dataTransfer.files[0]);
        },
        [processFile],
    );

    const handleFileSelect = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            processFile(event.target.files?.[0]);
            event.target.value = "";
        },
        [processFile],
    );

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
                    className={cn(
                        "mt-4 rounded-2xl border border-dashed px-4 py-5 text-center transition",
                        isDragOver
                            ? "border-orange-200/60 bg-orange-300/10"
                            : "border-white/18 bg-black/20",
                        isUploadEnabled
                            ? "cursor-pointer hover:border-orange-200/45 hover:bg-orange-300/5"
                            : "cursor-not-allowed opacity-75",
                    )}
                    onClick={() => {
                        if (isUploadEnabled) {
                            fileInputRef.current?.click();
                        }
                    }}
                    onDrop={handleDrop}
                    onDragOver={(event) => {
                        event.preventDefault();
                        if (isUploadEnabled) {
                            setIsDragOver(true);
                        }
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    aria-disabled={!isUploadEnabled}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={formatAcceptedExtensions()}
                        disabled={!isUploadEnabled}
                        onChange={handleFileSelect}
                        className="sr-only"
                    />
                    {isProcessing ? (
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-orange-100" />
                    ) : selectedFileName ? (
                        <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-200" />
                    ) : (
                        <UploadCloud className="mx-auto h-6 w-6 text-white/45" />
                    )}
                    <p className="mt-2 text-sm font-medium text-white/82">
                        {isProcessing
                            ? "Parsing resume..."
                            : selectedFileName
                              ? selectedFileName
                              : "Drop resume here, or browse"}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                        PDF only, max 5MB.
                    </p>
                    {visibleError && (
                        <div className="mx-auto mt-3 flex max-w-md items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs text-red-100">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{visibleError}</span>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
