export type JsonMap = Record<string, unknown>;

export type AgentMessageDTO = {
    id?: string;
    sessionId?: string;
    sequenceNo?: number;
    role?: string;
    content?: string;
    createdAt?: string;
};

export type AgentToolRequestDTO = {
    tool_name?: string;
    toolName?: string;
    rationale?: string;
    arguments?: JsonMap;
};

export type AgentUiBlockedOn =
    | "resume_or_manual_context"
    | "content_foundation"
    | "style_selection"
    | null;

export type AgentUiHintsDTO = {
    requestedResumeUpload?: boolean;
    requestedManualContext?: boolean;
    blockedOn?: AgentUiBlockedOn | string | null;
};

export type AgentStructuredPlanDTO = {
    assistant_message?: string;
    assistantMessage?: string;
    session_status?: string;
    sessionStatus?: string;
    memory_updates?: unknown;
    memoryUpdates?: unknown;
    ui_hints?: AgentUiHintsDTO;
    uiHints?: AgentUiHintsDTO;
    tool_requests?: AgentToolRequestDTO[];
    toolRequests?: AgentToolRequestDTO[];
};

export type AgentToolCallDTO = {
    toolName?: string;
    toolType?: string;
    status?: string;
    rationale?: string;
    inputJson?: JsonMap;
    outputJson?: JsonMap;
    errorMessage?: string;
    feedsSynthesis?: boolean;
};

export type AgentTurnResponse = {
    sessionId?: string;
    runId?: string;
    assistantMessage?: AgentMessageDTO;
    structuredResponse?: AgentStructuredPlanDTO;
    toolCalls?: AgentToolCallDTO[];
};

export type AgentTurnFailure = {
    code?: string;
    error?: string;
    message?: string;
};
