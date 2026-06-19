import type {
    AgentTurnResponse,
    AgentUiBlockedOn,
    AgentUiHintsDTO,
} from "@/types/agent";

export type NormalizedAgentUiHints = {
    requestedResumeUpload: boolean;
    requestedManualContext: boolean;
    blockedOn: AgentUiBlockedOn;
};

const EMPTY_AGENT_UI_HINTS: NormalizedAgentUiHints = {
    requestedResumeUpload: false,
    requestedManualContext: false,
    blockedOn: null,
};

const normalizeBlockedOn = (
    blockedOn: AgentUiHintsDTO["blockedOn"],
): AgentUiBlockedOn => {
    if (
        blockedOn === "resume_or_manual_context" ||
        blockedOn === "content_foundation" ||
        blockedOn === "style_selection"
    ) {
        return blockedOn;
    }
    return null;
};

export const normalizeAgentUiHints = (
    uiHints?: AgentUiHintsDTO | null,
): NormalizedAgentUiHints => {
    if (!uiHints) {
        return EMPTY_AGENT_UI_HINTS;
    }

    return {
        requestedResumeUpload: uiHints.requestedResumeUpload === true,
        requestedManualContext: uiHints.requestedManualContext === true,
        blockedOn: normalizeBlockedOn(uiHints.blockedOn),
    };
};

export const getAgentUiHints = (
    response?: AgentTurnResponse | null,
): NormalizedAgentUiHints =>
    normalizeAgentUiHints(
        response?.structuredResponse?.ui_hints ??
            response?.structuredResponse?.uiHints,
    );
