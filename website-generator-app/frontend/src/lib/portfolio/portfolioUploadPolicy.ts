import type { PortfolioUploadKind } from "./portfolioUploadClient";

/**
 * Client-side mirror of the backend `PortfolioUploadPolicy`. Validating at file
 * selection lets us reject oversized or unsupported files before the presign
 * request, so users get an actionable message instead of a generic 400.
 *
 * Limits and allowed types are kept identical to the backend so this check can
 * never reject a file the server would accept.
 */

type KindPolicy = {
    label: string;
    maxBytes: number;
    contentTypesByExtension: Record<string, string>;
};

const MB = 1024 * 1024;
const MAX_FILENAME_LENGTH = 255;

const POLICY_BY_KIND: Record<PortfolioUploadKind, KindPolicy> = {
    resume: {
        label: "resume",
        maxBytes: 5 * MB,
        contentTypesByExtension: {
            pdf: "application/pdf",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
    },
    image: {
        label: "image",
        maxBytes: 10 * MB,
        contentTypesByExtension: {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
        },
    },
    video: {
        label: "video",
        maxBytes: 50 * MB,
        contentTypesByExtension: {
            mp3: "audio/mpeg",
            mp4: "video/mp4",
            mov: "video/quicktime",
        },
    },
};

// Browsers often report a missing or generic MIME type (notably for .mov), so
// these are treated as "unknown" rather than a mismatch, matching the backend.
const GENERIC_CONTENT_TYPES = new Set(["", "application/octet-stream"]);

const extractExtension = (fileName: string): string | null => {
    const trimmed = fileName.trim();
    const dotIndex = trimmed.lastIndexOf(".");
    if (dotIndex < 0 || dotIndex === trimmed.length - 1) return null;
    return trimmed.slice(dotIndex + 1).toLowerCase();
};

const normalizeContentType = (rawContentType: string): string => {
    const lower = rawContentType.trim().toLowerCase();
    const semicolonIndex = lower.indexOf(";");
    return semicolonIndex >= 0 ? lower.slice(0, semicolonIndex).trim() : lower;
};

const contentTypeMatches = (expected: string, actual: string): boolean => {
    const normalized = normalizeContentType(actual);
    return GENERIC_CONTENT_TYPES.has(normalized) || normalized === expected;
};

const formatMb = (bytes: number): string => {
    const mb = bytes / MB;
    return `${Number.isInteger(mb) ? mb : mb.toFixed(1)}MB`;
};

/** Human-readable max size for a kind, e.g. "50MB", for UI copy. */
export const formatMaxSizeLabel = (kind: PortfolioUploadKind): string =>
    formatMb(POLICY_BY_KIND[kind].maxBytes);

/**
 * Validates a single browser-selected file against the policy for its kind.
 * Returns an error message suitable for display, or null when the file is valid.
 */
export const validatePortfolioUploadFile = (
    kind: PortfolioUploadKind,
    file: File,
): string | null => {
    const policy = POLICY_BY_KIND[kind];

    if (!file.name.trim()) return "File name is required";
    if (file.name.length > MAX_FILENAME_LENGTH) return "File name is too long";
    if (!Number.isFinite(file.size) || file.size <= 0) {
        return "File appears to be empty";
    }

    const extension = extractExtension(file.name);
    const allowedExtensions = Object.keys(policy.contentTypesByExtension);
    if (!extension || !policy.contentTypesByExtension[extension]) {
        return `Unsupported ${policy.label} type. Allowed: ${allowedExtensions
            .map((ext) => ext.toUpperCase())
            .join(", ")}`;
    }

    if (file.size > policy.maxBytes) {
        return `File is too large (${formatMb(file.size)}). Max ${policy.label} size is ${formatMb(policy.maxBytes)}`;
    }

    const expectedContentType = policy.contentTypesByExtension[extension];
    if (!contentTypeMatches(expectedContentType, file.type)) {
        return "File content does not match its file extension";
    }

    return null;
};
