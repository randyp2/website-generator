import { ONBOARDING_STEPS } from "../constants";
import type { FormState } from "../types";

const ONBOARDING_DRAFT_KEY_PREFIX = "portrn:onboarding-draft:";
const ONBOARDING_DRAFT_VERSION = 1;
const FORM_FIELDS = [
    "username",
    "firstName",
    "lastName",
    "bio",
    "location",
    "school",
    "degree",
    "jobTitle",
    "company",
    "websiteUrl",
    "linkedinUrl",
    "githubUrl",
] as const satisfies readonly (keyof FormState)[];

type StorageContract = Pick<
    Storage,
    "getItem" | "key" | "length" | "removeItem" | "setItem"
>;

type PersistedOnboardingDraft = {
    version: number;
    form: FormState;
    step: number;
};

/** Validated form and wizard position restored for one onboarding user. */
export type OnboardingDraft = Pick<
    PersistedOnboardingDraft,
    "form" | "step"
>;

const getDraftKey = (userId: string): string =>
    `${ONBOARDING_DRAFT_KEY_PREFIX}${encodeURIComponent(userId)}`;

/** Returns the serialized draft snapshot without parsing or mutating it. */
export const getOnboardingDraftSnapshot = (
    storage: StorageContract,
    userId: string,
): string | null => {
    try {
        return storage.getItem(getDraftKey(userId));
    } catch {
        return null;
    }
};

const isFormState = (value: unknown): value is FormState => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;
    return FORM_FIELDS.every((field) => typeof candidate[field] === "string");
};

const isValidStep = (value: unknown): value is number =>
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < ONBOARDING_STEPS.length;

/** Reads and validates the current user's onboarding draft. */
export const readOnboardingDraft = (
    storage: StorageContract,
    userId: string,
): OnboardingDraft | null => {
    const key = getDraftKey(userId);

    try {
        const serialized = getOnboardingDraftSnapshot(storage, userId);
        if (!serialized) {
            return null;
        }

        const parsed = JSON.parse(serialized) as Partial<PersistedOnboardingDraft>;
        if (
            parsed.version !== ONBOARDING_DRAFT_VERSION ||
            !isFormState(parsed.form) ||
            !isValidStep(parsed.step)
        ) {
            storage.removeItem(key);
            return null;
        }

        return {
            form: parsed.form,
            step: parsed.step,
        };
    } catch {
        try {
            storage.removeItem(key);
        } catch {
            // Storage can be unavailable in restricted browser contexts.
        }
        return null;
    }
};

/** Writes a versioned onboarding draft for one authenticated user. */
export const writeOnboardingDraft = (
    storage: StorageContract,
    userId: string,
    draft: OnboardingDraft,
): boolean => {
    const persisted: PersistedOnboardingDraft = {
        version: ONBOARDING_DRAFT_VERSION,
        form: draft.form,
        step: draft.step,
    };

    try {
        storage.setItem(getDraftKey(userId), JSON.stringify(persisted));
        return true;
    } catch {
        return false;
    }
};

/** Removes the onboarding draft for one authenticated user. */
export const clearOnboardingDraft = (
    storage: StorageContract,
    userId: string,
): void => {
    try {
        storage.removeItem(getDraftKey(userId));
    } catch {
        // A failed cleanup should not block navigation or sign-out.
    }
};

/** Removes every PortRN onboarding draft from the current tab. */
export const clearAllOnboardingDrafts = (storage: StorageContract): void => {
    try {
        const matchingKeys: string[] = [];
        for (let index = 0; index < storage.length; index += 1) {
            const key = storage.key(index);
            if (key?.startsWith(ONBOARDING_DRAFT_KEY_PREFIX)) {
                matchingKeys.push(key);
            }
        }

        matchingKeys.forEach((key) => storage.removeItem(key));
    } catch {
        // A failed cleanup should not block navigation or sign-out.
    }
};
