/**
 * Types
 *  - File Preview
 *  - Message
 *  - Device Mode
 *
 * Type definitions for AI preview page
 */

import { UploadedFile } from "./file";

// ============================================================================
// TYPES
// ============================================================================
/**
 * Extended file interface for preview functionality.
 * Extends the global UploadedFile type with preview-specific properties.
 *
 * @property file - The actual File object for upload
 * @property preview - Object URL for displaying image/video preview
 * @property fileType - Category of file (image or video) for UI rendering
 *
 * Inherits from UploadedFile:
 * @property id - Unique identifier (required in this context)
 * @property name - Original filename
 * @property size - File size in bytes
 * @property type - MIME type (e.g., "image/jpeg", "video/mp4")
 * @property title - Optional user-provided title
 * @property description - Optional user-provided description
 */
export interface FilePreview extends Omit<UploadedFile, "id"> {
    id: string; // Make id required instead of optional
    file: File;
    preview: string;
    fileType: "image" | "video";
}

export interface SectionPlan {
    sectionKey: string;
    action: "modify" | "keep" | "reorder";
    instruction: string;
    rationale: string;
    intensity: "LIGHT" | "MEDIUM" | "STRONG";
    preserveElements: string[];
}

export interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
    isGenerating?: boolean;
    // Refinement flow metadata
    messageType?: "clarify" | "plan" | "build" | "error";
    readyForPlanning?: boolean;
    sectionPlans?: SectionPlan[];
    planSummary?: string;
}

export type DeviceMode = "desktop" | "tablet" | "mobile";
