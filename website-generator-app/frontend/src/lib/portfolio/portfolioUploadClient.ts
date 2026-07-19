import type { UploadedFile } from "@/types/file";
import type { ParsedResumeData } from "@/types/resume";
import { createClient } from "@/utils/supabase/client";

export type PortfolioUploadKind = "resume" | "image" | "video";

export interface PortfolioUploadCandidate {
    clientId: string;
    kind: PortfolioUploadKind;
    upload: UploadedFile;
}

export interface PortfolioUploadInstruction {
    clientId: string;
    kind: PortfolioUploadKind;
    bucket: string;
    path: string;
    token: string;
    contentType: string;
}

interface PortfolioUploadPresignResponse {
    uploads: PortfolioUploadInstruction[];
}

export interface PortfolioFinalizePayload {
    resumeRawFileBucket: string | null;
    resumeRawFilePath: string | null;
    assets: Array<{
        kind: "image" | "video";
        storageBucket: string;
        storagePath: string;
        title: string;
        description: string;
        label: string;
        sectionHint: string;
        alt: string;
    }>;
    templateId: string;
    lastStep: string;
}

export interface PortfolioFinalizeResponse {
    portfolio?: { id?: string };
    portfolioId?: string;
}

const readErrorMessage = async (
    response: Response,
    fallback: string,
): Promise<string> => {
    const rawBody = await response.text().catch(() => "");
    if (!rawBody.trim()) return fallback;
    try {
        const payload: unknown = JSON.parse(rawBody);
        if (typeof payload === "object" && payload !== null) {
            for (const key of ["error", "message", "detail"] as const) {
                const value = (payload as Record<string, unknown>)[key];
                if (typeof value === "string" && value.trim()) return value;
            }
        }
    } catch {
        return rawBody.trim();
    }
    return fallback;
};

/**
 * Requests scoped tokens and uploads each file directly from the browser to
 * Supabase. No file bytes pass through a Next.js route.
 */
export const uploadPortfolioFiles = async (
    portfolioId: string,
    candidates: PortfolioUploadCandidate[],
): Promise<Map<string, PortfolioUploadInstruction>> => {
    if (candidates.length === 0) return new Map();

    const presignResponse = await fetch(
        `/api/portfolio/${portfolioId}/uploads/presign`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                files: candidates.map(({ clientId, kind, upload }) => ({
                    clientId,
                    kind,
                    originalFileName: upload.file.name,
                    contentType: upload.file.type,
                    fileSizeBytes: upload.file.size,
                })),
            }),
        },
    );
    if (!presignResponse.ok) {
        throw new Error(
            await readErrorMessage(
                presignResponse,
                "Failed to prepare file uploads.",
            ),
        );
    }

    const payload = (await presignResponse.json()) as PortfolioUploadPresignResponse;
    const candidatesById = new Map(
        candidates.map((candidate) => [candidate.clientId, candidate]),
    );
    const instructionsById = new Map(
        payload.uploads.map((instruction) => [instruction.clientId, instruction]),
    );
    if (instructionsById.size !== candidates.length) {
        throw new Error("The upload service returned an incomplete upload batch.");
    }

    const supabase = createClient();
    await Promise.all(payload.uploads.map(async (instruction) => {
        const candidate = candidatesById.get(instruction.clientId);
        if (!candidate || candidate.kind !== instruction.kind) {
            throw new Error("The upload service returned mismatched file instructions.");
        }
        const { error } = await supabase.storage
            .from(instruction.bucket)
            .uploadToSignedUrl(
                instruction.path,
                instruction.token,
                candidate.upload.file,
                {
                    contentType: instruction.contentType,
                    upsert: false,
                },
            );
        if (error) {
            throw new Error(`Failed to upload ${candidate.upload.file.name}: ${error.message}`);
        }
    }));

    return instructionsById;
};

/** Saves only verified storage coordinates and asset metadata. */
export const finalizePortfolioUploads = async (
    portfolioId: string,
    payload: PortfolioFinalizePayload,
): Promise<PortfolioFinalizeResponse> => {
    const response = await fetch(
        `/api/portfolio/${portfolioId}/uploads/finalize`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        },
    );
    if (!response.ok) {
        throw new Error(
            await readErrorMessage(response, "Failed to finalize uploaded files."),
        );
    }
    return (await response.json()) as PortfolioFinalizeResponse;
};

/** Parses the finalized private resume by storage reference. */
export const parseUploadedResume = async (
    portfolioId: string,
): Promise<ParsedResumeData> => {
    const response = await fetch(
        `/api/portfolio/${portfolioId}/resume/parse-uploaded`,
        { method: "POST" },
    );
    if (!response.ok) {
        throw new Error(
            await readErrorMessage(response, "Failed to parse resume."),
        );
    }
    return (await response.json()) as ParsedResumeData;
};
