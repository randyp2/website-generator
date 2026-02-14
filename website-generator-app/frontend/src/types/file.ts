/**
 * File Types
 *
 * Type definitions for file upload functionality across the application.
 */

/**
 * Represents an uploaded file with metadata
 *
 * Used throughout the application to track files that users upload,
 * including their basic file properties and user-provided metadata.
 *
 * @property name - Original filename from the user's system
 * @property size - File size in bytes
 * @property type - MIME type of the file (e.g., "image/jpeg", "application/pdf")
 * @property title - (Optional) User-provided title for the file
 * @property description - (Optional) User-provided description of the file
 */
export interface UploadedFile {
    id?: string;
    file: File;
    type: string;
    name: string;
    title?: string;
    description?: string;
    sectionHint?: string;
    size: number;
}
