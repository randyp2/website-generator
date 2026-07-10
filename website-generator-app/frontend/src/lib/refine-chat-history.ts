import type { Message, SectionPlan } from "@/types/preview";

type MessageType = NonNullable<Message["messageType"]>;
type Role = Message["role"];

export interface PersistedRefineChatMessage {
    id: string;
    role: Role;
    content: string;
    timestamp: string;
    isGenerating?: boolean | null;
    messageType?: MessageType | null;
    readyForPlanning?: boolean | null;
    sectionPlans?: SectionPlan[] | null;
    planSummary?: string | null;
}

const MESSAGE_TYPES = new Set<MessageType>([
    "clarify",
    "plan",
    "build",
    "error",
]);

const SECTION_ACTIONS = new Set<SectionPlan["action"]>([
    "modify",
    "keep",
    "reorder",
    "add",
    "delete",
]);

const CHANGE_INTENSITIES = new Set<SectionPlan["intensity"]>([
    "LIGHT",
    "MEDIUM",
    "STRONG",
]);

/**
 * Validates the durable refine chat history shape returned by the API.
 */
export const isRefineChatHistory = (
    value: unknown,
): value is PersistedRefineChatMessage[] => {
    if (!Array.isArray(value)) return false;

    return value.every((item) => {
        if (!item || typeof item !== "object") return false;

        const message = item as Record<string, unknown>;
        if (
            typeof message.id !== "string" ||
            (message.role !== "user" && message.role !== "ai") ||
            typeof message.content !== "string" ||
            typeof message.timestamp !== "string"
        ) {
            return false;
        }

        if (
            message.messageType != null &&
            (typeof message.messageType !== "string" ||
                !MESSAGE_TYPES.has(message.messageType as MessageType))
        ) {
            return false;
        }

        if (
            message.sectionPlans != null &&
            !isSectionPlanList(message.sectionPlans)
        ) {
            return false;
        }

        return true;
    });
};

/**
 * Converts persisted refine chat messages into UI messages with Date timestamps.
 */
export const toUiRefineMessages = (
    messages: PersistedRefineChatMessage[],
): Message[] =>
    messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: new Date(message.timestamp),
        ...(message.messageType ? { messageType: message.messageType } : {}),
        ...(message.readyForPlanning != null
            ? { readyForPlanning: message.readyForPlanning }
            : {}),
        ...(message.sectionPlans?.length
            ? { sectionPlans: message.sectionPlans }
            : {}),
        ...(message.planSummary ? { planSummary: message.planSummary } : {}),
    }));

const isSectionPlanList = (value: unknown): value is SectionPlan[] => {
    if (!Array.isArray(value)) return false;
    return value.every(isSectionPlan);
};

const isSectionPlan = (value: unknown): value is SectionPlan => {
    if (!value || typeof value !== "object") return false;

    const plan = value as Record<string, unknown>;
    return (
        typeof plan.sectionKey === "string" &&
        typeof plan.action === "string" &&
        SECTION_ACTIONS.has(plan.action as SectionPlan["action"]) &&
        typeof plan.instruction === "string" &&
        typeof plan.rationale === "string" &&
        typeof plan.intensity === "string" &&
        CHANGE_INTENSITIES.has(plan.intensity as SectionPlan["intensity"]) &&
        Array.isArray(plan.preserveElements) &&
        plan.preserveElements.every((item) => typeof item === "string") &&
        isOptionalString(plan.newSectionTitle) &&
        isOptionalString(plan.insertAfterSectionKey) &&
        isOptionalNumber(plan.orderIndex)
    );
};

const isOptionalString = (value: unknown): boolean =>
    value == null || typeof value === "string";

const isOptionalNumber = (value: unknown): boolean =>
    value == null || typeof value === "number";
