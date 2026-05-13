export type ClaimEvidenceUploadDescriptor = {
    originalFileName: string;
    contentType: string;
    fileSizeBytes: number;
};

type FilePolicy = {
    contentType: string;
    maxBytes: number;
};

const MB = 1024 * 1024;
const MAX_FILENAME_LENGTH = 255;

const FILE_POLICY_BY_EXTENSION: Record<string, FilePolicy> = {
    pdf: { contentType: "application/pdf", maxBytes: 10 * MB },
    png: { contentType: "image/png", maxBytes: 5 * MB },
    jpg: { contentType: "image/jpeg", maxBytes: 5 * MB },
    jpeg: { contentType: "image/jpeg", maxBytes: 5 * MB },
    txt: { contentType: "text/plain", maxBytes: 1 * MB },
};

const CONTENT_TYPE_ALIASES: Record<string, string> = {
    "image/jpg": "image/jpeg",
};

export const CLAIM_EVIDENCE_ACCEPT_ATTR = ".pdf,.png,.jpg,.jpeg,.txt";

export const normalizeClaimEvidenceContentType = (
    rawContentType: string | null | undefined,
): string => {
    if (typeof rawContentType !== "string") return "";
    const lower = rawContentType.trim().toLowerCase();
    if (!lower) return "";

    const semicolonIndex = lower.indexOf(";");
    const normalized =
        semicolonIndex >= 0 ? lower.substring(0, semicolonIndex).trim() : lower;

    return CONTENT_TYPE_ALIASES[normalized] ?? normalized;
};

export const extractClaimEvidenceExtension = (
    fileName: string,
): string | null => {
    if (typeof fileName !== "string") return null;
    const trimmed = fileName.trim();
    if (!trimmed) return null;
    const slashIndex = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
    const basename =
        slashIndex >= 0 && slashIndex < trimmed.length - 1
            ? trimmed.slice(slashIndex + 1)
            : trimmed;

    const dotIndex = basename.lastIndexOf(".");
    if (dotIndex < 0 || dotIndex === basename.length - 1) return null;
    return basename.slice(dotIndex + 1).toLowerCase();
};

export const resolveClaimEvidenceContentType = (
    fileName: string,
    rawContentType: string | null | undefined,
): string => {
    const normalized = normalizeClaimEvidenceContentType(rawContentType);
    if (normalized) return normalized;

    const extension = extractClaimEvidenceExtension(fileName);
    if (!extension) return "";
    return FILE_POLICY_BY_EXTENSION[extension]?.contentType ?? "";
};

export const validateClaimEvidenceUploadDescriptor = (
    descriptor: ClaimEvidenceUploadDescriptor,
): string | null => {
    const originalFileName = descriptor.originalFileName?.trim() ?? "";
    if (!originalFileName) return "File name is required";
    if (originalFileName.length > MAX_FILENAME_LENGTH) {
        return "File name is too long";
    }

    if (
        !Number.isFinite(descriptor.fileSizeBytes) ||
        descriptor.fileSizeBytes <= 0
    ) {
        return "File size must be greater than 0 bytes";
    }

    const extension = extractClaimEvidenceExtension(originalFileName);
    if (!extension) {
        return "File extension is required";
    }

    const policy = FILE_POLICY_BY_EXTENSION[extension];
    if (!policy) {
        return "Unsupported file type. Allowed: PDF, PNG, JPG, JPEG, TXT";
    }

    const normalizedContentType = normalizeClaimEvidenceContentType(
        descriptor.contentType,
    );
    if (!normalizedContentType) {
        return "File content type is required";
    }

    if (normalizedContentType !== policy.contentType) {
        return "File extension does not match file content type";
    }

    if (descriptor.fileSizeBytes > policy.maxBytes) {
        const maxMb = Math.floor(policy.maxBytes / MB);
        return `File is too large for this type (max ${maxMb}MB)`;
    }

    return null;
};

export const buildClaimEvidenceUploadDescriptorFromFile = (
    file: File,
): ClaimEvidenceUploadDescriptor => ({
    originalFileName: file.name,
    contentType: resolveClaimEvidenceContentType(file.name, file.type),
    fileSizeBytes: file.size,
});
