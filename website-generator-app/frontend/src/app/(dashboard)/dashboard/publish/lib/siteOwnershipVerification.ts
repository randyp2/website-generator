export type SiteVerificationStatus = "PENDING" | "VERIFIED" | "EXPIRED";

export interface SiteOwnershipChallenge {
    verificationId: string;
    verificationUrl: string;
    canonicalOrigin: string;
    method: "HTML_META";
    status: SiteVerificationStatus;
    verificationTag: string;
    challengeExpiresAt: string;
    verifiedAt: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === "object" && !Array.isArray(value);

const parseChallenge = (value: unknown): SiteOwnershipChallenge => {
    if (!isRecord(value)) throw new Error("Invalid verification response");

    const status = value.status;
    if (
        typeof value.verificationId !== "string" ||
        typeof value.verificationUrl !== "string" ||
        typeof value.canonicalOrigin !== "string" ||
        value.method !== "HTML_META" ||
        (status !== "PENDING" && status !== "VERIFIED" && status !== "EXPIRED") ||
        typeof value.verificationTag !== "string" ||
        typeof value.challengeExpiresAt !== "string" ||
        (value.verifiedAt !== null && typeof value.verifiedAt !== "string")
    ) {
        throw new Error("Invalid verification response");
    }

    return {
        verificationId: value.verificationId,
        verificationUrl: value.verificationUrl,
        canonicalOrigin: value.canonicalOrigin,
        method: value.method,
        status,
        verificationTag: value.verificationTag,
        challengeExpiresAt: value.challengeExpiresAt,
        verifiedAt: value.verifiedAt,
    };
};

const readErrorMessage = async (response: Response): Promise<string> => {
    const payload: unknown = await response.json().catch(() => null);
    if (isRecord(payload)) {
        if (typeof payload.error === "string" && payload.error.trim()) {
            return payload.error;
        }
        if (typeof payload.detail === "string" && payload.detail.trim()) {
            return payload.detail;
        }
    }
    return "Unable to create website verification challenge";
};

/** Creates or reuses the ownership challenge for an external website. */
export const createSiteOwnershipChallenge = async (
    externalUrl: string,
    signal?: AbortSignal,
): Promise<SiteOwnershipChallenge> => {
    const response = await fetch("/api/portfolio/site-verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalUrl }),
        signal,
    });
    if (!response.ok) throw new Error(await readErrorMessage(response));
    return parseChallenge(await response.json());
};
