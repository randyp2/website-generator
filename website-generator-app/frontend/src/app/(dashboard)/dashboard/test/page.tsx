"use client";

import { PortfolioStyleChat } from "@/components/chat/PortfolioStyleChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    buildAgentResumeContextMessage,
    parseResumeForAgent,
    persistPortfolioResume,
} from "@/lib/agent-resume";
import { getAgentUiHints } from "@/lib/agent-ui-hints";
import { cn } from "@/lib/utils";
import type {
    AgentToolCallDTO,
    AgentToolRequestDTO,
    AgentTurnFailure,
    AgentTurnResponse,
} from "@/types/agent";
import type { Message } from "@/types/preview";
import {
    AlertCircle,
    Braces,
    CheckCircle2,
    ClipboardList,
    FileText,
    Hammer,
    Loader2,
    Route,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const createMessageId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const jsonPreview = (value: unknown): string =>
    JSON.stringify(value ?? {}, null, 2);

const getAssistantContent = (response: AgentTurnResponse): string =>
    response.assistantMessage?.content?.trim() ||
    response.structuredResponse?.assistant_message?.trim() ||
    response.structuredResponse?.assistantMessage?.trim() ||
    "The agent completed the turn without returning assistant content.";

const getToolRequests = (
    response: AgentTurnResponse | null,
): AgentToolRequestDTO[] =>
    response?.structuredResponse?.tool_requests ??
    response?.structuredResponse?.toolRequests ??
    [];

const getToolRequestName = (toolRequest: AgentToolRequestDTO): string =>
    toolRequest.tool_name ?? toolRequest.toolName ?? "unknown_tool";

type SubmitAgentTurnOptions = {
    agentMessage: string;
    visibleUserMessage?: string;
    appendVisibleUserMessage?: boolean;
};

const DebugField = ({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) => (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
            {label}
        </p>
        <p className="mt-1 truncate font-mono text-xs text-white/80">
            {value || "none"}
        </p>
    </div>
);

const JsonBlock = ({ value }: { value: unknown }) => (
    <pre className="max-h-56 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-white/70">
        {jsonPreview(value)}
    </pre>
);

const ToolCallCard = ({
    toolCall,
    index,
}: {
    toolCall: AgentToolCallDTO;
    index: number;
}) => (
    <div className="rounded-2xl border border-white/10 bg-[#111216]/80 p-4">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                    Tool {index + 1}
                </p>
                <h3 className="mt-1 truncate font-mono text-sm font-semibold text-white">
                    {toolCall.toolName ?? "unknown_tool"}
                </h3>
            </div>
            <span
                className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                    toolCall.status === "SUCCEEDED"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : toolCall.status === "FAILED"
                          ? "border-red-400/30 bg-red-400/10 text-red-200"
                          : "border-amber-400/30 bg-amber-400/10 text-amber-200",
                )}
            >
                {toolCall.status ?? "UNKNOWN"}
            </span>
        </div>

        <div className="mt-3 space-y-2 text-sm">
            <p className="text-white/45">Rationale</p>
            <p className="rounded-xl bg-white/[0.04] p-3 text-white/78">
                {toolCall.rationale || "No rationale returned."}
            </p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
            <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-white/55 transition hover:text-white">
                    Input JSON
                </summary>
                <div className="mt-2">
                    <JsonBlock value={toolCall.inputJson} />
                </div>
            </details>
            <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-white/55 transition hover:text-white">
                    Output JSON
                </summary>
                <div className="mt-2">
                    <JsonBlock value={toolCall.outputJson} />
                </div>
            </details>
        </div>

        {toolCall.errorMessage && (
            <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100">
                {toolCall.errorMessage}
            </div>
        )}
    </div>
);

const PlannerToolRequestCard = ({
    toolRequest,
    index,
}: {
    toolRequest: AgentToolRequestDTO;
    index: number;
}) => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                    Requested Tool {index + 1}
                </p>
                <h3 className="mt-1 truncate font-mono text-sm font-semibold text-white">
                    {getToolRequestName(toolRequest)}
                </h3>
            </div>
            <Hammer className="h-4 w-4 text-white/45" />
        </div>
        <p className="mt-3 rounded-xl bg-white/[0.04] p-3 text-sm text-white/78">
            {toolRequest.rationale || "No rationale returned."}
        </p>
        <details className="mt-3">
            <summary className="cursor-pointer text-xs font-medium text-white/55 transition hover:text-white">
                Arguments
            </summary>
            <div className="mt-2">
                <JsonBlock value={toolRequest.arguments} />
            </div>
        </details>
    </div>
);

export default function AgentTesttPage() {
    const searchParams = useSearchParams();
    const [portfolioId, setPortfolioId] = useState(
        () => searchParams.get("portfolioId") ?? "",
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [lastResponse, setLastResponse] = useState<AgentTurnResponse | null>(
        null,
    );
    const [lastError, setLastError] = useState<AgentTurnFailure | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isParsingResume, setIsParsingResume] = useState(false);
    const [resumeUploadError, setResumeUploadError] = useState<string | null>(
        null,
    );
    const [selectedResumeFileName, setSelectedResumeFileName] = useState<
        string | null
    >(null);

    const plannerToolRequests = useMemo(
        () => getToolRequests(lastResponse),
        [lastResponse],
    );
    const uiHints = useMemo(
        () => getAgentUiHints(lastResponse),
        [lastResponse],
    );

    const handleNewPortfolio = async () => {
        if (isCreating) return;
        setIsCreating(true);
        setLastError(null);
        try {
            const response = await fetch("/api/portfolio/draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateId: "blank" }),
            });
            const payload = (await response.json().catch(() => null)) as
                | { portfolio?: { id?: string } }
                | AgentTurnFailure
                | null;

            if (!response.ok) {
                const failure = (payload ?? {
                    error: "Failed to create portfolio",
                }) as AgentTurnFailure;
                setLastError(failure);
                return;
            }

            const newId = (payload as { portfolio?: { id?: string } })
                ?.portfolio?.id;
            if (!newId) {
                setLastError({
                    error: "Draft created but no portfolio id returned.",
                });
                return;
            }

            setPortfolioId(newId);
            setMessages([]);
            setLastResponse(null);
            setResumeUploadError(null);
            setSelectedResumeFileName(null);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unexpected error creating portfolio.";
            setLastError({ error: message });
        } finally {
            setIsCreating(false);
        }
    };

    const submitAgentTurn = async ({
        agentMessage,
        visibleUserMessage = agentMessage,
        appendVisibleUserMessage = true,
    }: SubmitAgentTurnOptions) => {
        const normalizedAgentMessage = agentMessage.trim();
        const normalizedVisibleMessage = visibleUserMessage.trim();
        const normalizedPortfolioId = portfolioId.trim();
        if (!normalizedAgentMessage || isSending || isParsingResume) return;

        if (appendVisibleUserMessage && normalizedVisibleMessage) {
            const userMessage: Message = {
                id: createMessageId(),
                role: "user",
                content: normalizedVisibleMessage,
                timestamp: new Date(),
            };
            setMessages((current) => [...current, userMessage]);
        }

        setLastError(null);
        setLastResponse(null);

        if (!normalizedPortfolioId) {
            const errorMessage: Message = {
                id: createMessageId(),
                role: "ai",
                content:
                    "Add a portfolio ID in the debug panel before sending a test agent turn.",
                timestamp: new Date(),
                messageType: "error",
            };
            setMessages((current) => [...current, errorMessage]);
            setLastError({ error: "portfolioId is required" });
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch("/api/agent/turn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    portfolioId: normalizedPortfolioId,
                    userMessage: normalizedAgentMessage,
                }),
            });

            const payload = (await response.json().catch(() => null)) as
                | AgentTurnResponse
                | AgentTurnFailure
                | null;

            if (!response.ok) {
                const failure = (payload ?? {
                    error: "Agent turn request failed",
                }) as AgentTurnFailure;
                setLastError(failure);

                setMessages((current) => [
                    ...current,
                    {
                        id: createMessageId(),
                        role: "ai",
                        content:
                            failure.error ||
                            failure.message ||
                            "Agent turn request failed.",
                        timestamp: new Date(),
                        messageType: "error",
                    },
                ]);
                return;
            }

            const data = (payload ?? {}) as AgentTurnResponse;
            setLastResponse(data);
            setMessages((current) => [
                ...current,
                {
                    id: createMessageId(),
                    role: "ai",
                    content: getAssistantContent(data),
                    timestamp: new Date(),
                },
            ]);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unexpected agent turn error.";
            setLastError({ error: message });
            setMessages((current) => [
                ...current,
                {
                    id: createMessageId(),
                    role: "ai",
                    content: message,
                    timestamp: new Date(),
                    messageType: "error",
                },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const handleSend = async (prompt: string) => {
        await submitAgentTurn({ agentMessage: prompt });
    };

    const handleResumeFileSelected = async (file: File) => {
        const normalizedPortfolioId = portfolioId.trim();
        if (!normalizedPortfolioId) {
            const error = "portfolioId is required before parsing a resume.";
            setLastError({ error });
            setResumeUploadError(error);
            setMessages((current) => [
                ...current,
                {
                    id: createMessageId(),
                    role: "ai",
                    content:
                        "Add a portfolio ID in the debug panel before uploading a resume.",
                    timestamp: new Date(),
                    messageType: "error",
                },
            ]);
            return;
        }

        const progressMessageId = createMessageId();
        setIsParsingResume(true);
        setSelectedResumeFileName(file.name);
        setResumeUploadError(null);
        setLastError(null);
        setMessages((current) => [
            ...current,
            {
                id: createMessageId(),
                role: "user",
                content: `Uploaded resume: ${file.name}`,
                timestamp: new Date(),
            },
            {
                id: progressMessageId,
                role: "ai",
                content: "Parsing your resume and saving it to this portfolio...",
                timestamp: new Date(),
                isGenerating: true,
            },
        ]);

        try {
            const parsedResume = await parseResumeForAgent(file);
            await persistPortfolioResume(normalizedPortfolioId, parsedResume);
            const resumeContextMessage = buildAgentResumeContextMessage({
                fileName: file.name,
                parsedResume,
            });

            setMessages((current) =>
                current.filter((message) => message.id !== progressMessageId),
            );
            setIsParsingResume(false);

            await submitAgentTurn({
                agentMessage: resumeContextMessage,
                appendVisibleUserMessage: false,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to parse resume.";
            setResumeUploadError(message);
            setLastError({ error: message });
            setMessages((current) =>
                current.map((existingMessage) =>
                    existingMessage.id === progressMessageId
                        ? {
                              ...existingMessage,
                              content: message,
                              messageType: "error",
                              isGenerating: false,
                          }
                        : existingMessage,
                ),
            );
        } finally {
            setIsParsingResume(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-4rem)] px-3 py-3 md:px-4">
            <div className="grid h-[calc(100vh-5.25rem)] grid-cols-1 gap-3 xl:grid-cols-2">
                <section className="min-h-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0f1014] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                    <PortfolioStyleChat
                        messages={messages}
                        isSending={isSending || isParsingResume}
                        onSendMessage={handleSend}
                        agentUiHints={uiHints}
                        isResumeProcessing={isParsingResume}
                        resumeUploadError={resumeUploadError}
                        selectedResumeFileName={selectedResumeFileName}
                        onResumeFileSelected={handleResumeFileSelected}
                        className="h-full max-w-none"
                    />
                </section>

                <aside className="min-h-0 overflow-hidden rounded-3xl border border-white/10 bg-[#090a0d] text-white shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
                    <div className="flex h-full min-h-0 flex-col">
                        <div className="border-b border-white/10 px-5 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 text-white">
                                        <Route className="h-5 w-5 text-orange-300" />
                                        <h1 className="text-lg font-semibold">
                                            Agent Orchestrator Debug
                                        </h1>
                                    </div>
                                    <p className="mt-1 text-sm text-white/50">
                                        Inspect planner decisions, executed tools,
                                        and raw turn payloads.
                                    </p>
                                </div>
                                <div
                                    className={cn(
                                        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                                        isSending
                                            ? "border-blue-400/30 bg-blue-400/10 text-blue-100"
                                            : lastError
                                              ? "border-red-400/30 bg-red-400/10 text-red-100"
                                              : lastResponse
                                                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                                                : "border-white/10 bg-white/[0.04] text-white/55",
                                    )}
                                >
                                    {isSending ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : lastError ? (
                                        <AlertCircle className="h-3.5 w-3.5" />
                                    ) : lastResponse ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    ) : (
                                        <ClipboardList className="h-3.5 w-3.5" />
                                    )}
                                    {isSending
                                        ? "Running"
                                        : lastError
                                          ? "Error"
                                          : lastResponse
                                            ? "Ready"
                                            : "Idle"}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
                                <Input
                                    value={portfolioId}
                                    onChange={(event) =>
                                        setPortfolioId(event.target.value)
                                    }
                                    placeholder="Portfolio ID required by the backend agent"
                                    className="rounded-xl border-white/10 bg-white/[0.05] font-mono text-xs text-white placeholder:text-white/35 focus-visible:ring-orange-300/30"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setMessages([]);
                                        setLastResponse(null);
                                        setLastError(null);
                                        setResumeUploadError(null);
                                        setSelectedResumeFileName(null);
                                    }}
                                    className="rounded-xl border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white"
                                >
                                    Clear
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleNewPortfolio}
                                    disabled={isCreating}
                                    className="rounded-xl border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20 hover:text-emerald-100"
                                >
                                    {isCreating ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        "New"
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <DebugField
                                    label="Session"
                                    value={lastResponse?.sessionId}
                                />
                                <DebugField
                                    label="Run"
                                    value={lastResponse?.runId}
                                />
                            </div>

                            <section className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-orange-300" />
                                        <h2 className="text-sm font-semibold text-white">
                                            Agent UI Hints
                                        </h2>
                                    </div>
                                    <span
                                        className={cn(
                                            "rounded-full border px-2 py-1 text-xs",
                                            uiHints.requestedResumeUpload ||
                                                uiHints.requestedManualContext
                                                ? "border-orange-300/30 bg-orange-300/10 text-orange-100"
                                                : "border-white/10 bg-white/[0.04] text-white/45",
                                        )}
                                    >
                                        {uiHints.blockedOn ?? "none"}
                                    </span>
                                </div>
                                <JsonBlock value={uiHints} />
                            </section>

                            {lastError && (
                                <section className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                                    <div className="flex items-center gap-2 text-red-100">
                                        <AlertCircle className="h-4 w-4" />
                                        <h2 className="text-sm font-semibold">
                                            Last Error
                                        </h2>
                                    </div>
                                    <p className="mt-2 text-sm text-red-100/85">
                                        {lastError.error ||
                                            lastError.message ||
                                            "Unknown error"}
                                    </p>
                                    {lastError.code && (
                                        <p className="mt-2 font-mono text-xs text-red-100/60">
                                            {lastError.code}
                                        </p>
                                    )}
                                </section>
                            )}

                            <section className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Hammer className="h-4 w-4 text-orange-300" />
                                        <h2 className="text-sm font-semibold text-white">
                                            Executed Tool Calls
                                        </h2>
                                    </div>
                                    <span className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-white/50">
                                        {lastResponse?.toolCalls?.length ?? 0}
                                    </span>
                                </div>

                                {lastResponse?.toolCalls?.length ? (
                                    <div className="space-y-3">
                                        {lastResponse.toolCalls.map(
                                            (toolCall, index) => (
                                                <ToolCallCard
                                                    key={`${toolCall.toolName ?? "tool"}-${index}`}
                                                    toolCall={toolCall}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-5 text-sm text-white/45">
                                        No executed tool calls yet.
                                    </div>
                                )}
                            </section>

                            <section className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4 text-blue-300" />
                                        <h2 className="text-sm font-semibold text-white">
                                            Planner Tool Requests
                                        </h2>
                                    </div>
                                    <span className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-white/50">
                                        {plannerToolRequests.length}
                                    </span>
                                </div>

                                {plannerToolRequests.length ? (
                                    <div className="space-y-3">
                                        {plannerToolRequests.map(
                                            (toolRequest, index) => (
                                                <PlannerToolRequestCard
                                                    key={`${getToolRequestName(toolRequest)}-${index}`}
                                                    toolRequest={toolRequest}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-5 text-sm text-white/45">
                                        No planner tool requests yet.
                                    </div>
                                )}
                            </section>

                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Braces className="h-4 w-4 text-white/45" />
                                    <h2 className="text-sm font-semibold text-white">
                                        Raw Agent Response
                                    </h2>
                                </div>
                                <JsonBlock
                                    value={
                                        lastResponse ?? lastError ?? {
                                            message:
                                                "Send a turn to inspect the response.",
                                        }
                                    }
                                />
                            </section>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
