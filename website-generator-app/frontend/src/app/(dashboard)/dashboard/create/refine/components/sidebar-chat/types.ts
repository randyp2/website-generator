"use client";

import type { Message as PreviewMessage } from "@/types/preview";

export type ChatLayoutMode = "sidebar" | "floating" | "preview";

export type ChatMessage = PreviewMessage & { isGenerating?: boolean };
