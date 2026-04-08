import { UUID } from "node:crypto";

type Timestamp = string;
import type { PersistedStyleChatMessage } from "./style-chat";

export interface Portfolio {
    id: UUID;
    title: string;
    status: string;
    template_id: string;
    last_step?: string | null;
    slug?: string | null;
    description?: string | null;
    style_chat_history?: PersistedStyleChatMessage[] | null;
    screenshot_url?: string | null;
    updated_at: Timestamp;
    created_at: Timestamp;
}

export interface AssetMeta {
    title?: string;
    description?: string;
    label?: string;
    sectionHint?: string;
    alt?: string;
    name?: string;
}

export interface SectionDTO {
    sectionKey: string;
    title?: string;
    orderIndex?: number;
    contentJson: unknown;
    reactSource: string;
    changeDescription: string | null;
}

export interface GlobalTheme {
    background: string; // Tailwind classes: "bg-gradient-to-b from-slate-900 to-slate-800"
    textPrimary: string; // "text-white"
    textSecondary: string; // "text-slate-400"
    accentColor: string; // "purple"
    fonts?: { heading: string; body: string };
}

export interface GeneratedSection {
    sectionKey: string;
    title?: string | null;
    orderIndex?: number | null;
    reactSource?: string | null;
    contentJson?: Record<string, unknown> | null;
}

export interface JobStatusResponse {
    jobId: string;
    portfolioId: string;
    status: string;
    completedCount: number;
    totalSections: number;
    error: string | null;
}

export interface CompletedSectionsResponse {
    sections: SectionDTO[];
    status: string;
    completedCount: number;
    totalSections: number;
}
