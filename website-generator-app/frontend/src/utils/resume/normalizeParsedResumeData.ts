import type {
    ParsedEducation,
    ParsedExperience,
    ParsedProject,
    ParsedResumeData,
} from "@/types/resume";

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const asText = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    return String(value);
};

const asNullableText = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    return asText(value);
};

const asStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.map(asText);
};

const asObjectArray = (value: unknown): JsonRecord[] => {
    if (!Array.isArray(value)) return [];
    return value.filter(isRecord);
};

const normalizeExperience = (experience: JsonRecord): ParsedExperience => ({
    rawBlock: asText(experience.rawBlock),
    title: asText(experience.title),
    company: asText(experience.company),
    startDate: asText(experience.startDate),
    endDate: asText(experience.endDate),
    location: asNullableText(experience.location),
    bullets: asStringArray(experience.bullets),
});

const normalizeProject = (project: JsonRecord): ParsedProject => ({
    rawBlock: asText(project.rawBlock),
    header: asText(project.header),
    bullets: asStringArray(project.bullets),
    link: asNullableText(project.link),
});

const normalizeEducation = (education: JsonRecord): ParsedEducation => ({
    institution: asText(education.institution),
    degree: asText(education.degree),
    startDate: asNullableText(education.startDate),
    endDate: asText(education.endDate),
    gpa: asNullableText(education.gpa),
    awards: asNullableText(education.awards),
    courseWork: asNullableText(education.courseWork),
});

/**
 * Normalizes untrusted parsed resume JSON into the non-null array contract used
 * by the review UI and portfolio generation flow.
 */
export const normalizeParsedResumeData = (
    resume: unknown,
): ParsedResumeData | null => {
    if (!isRecord(resume)) return null;

    return {
        normalizedText: asText(resume.normalizedText),
        fullName: asText(resume.fullName),
        email: asText(resume.email),
        phone: asText(resume.phone),
        location: asText(resume.location),
        summary: asText(resume.summary),
        skills: asStringArray(resume.skills),
        experiences: asObjectArray(resume.experiences).map(normalizeExperience),
        projects: asObjectArray(resume.projects).map(normalizeProject),
        educations: asObjectArray(resume.educations).map(normalizeEducation),
        confidenceScore:
            typeof resume.confidenceScore === "number"
                ? resume.confidenceScore
                : undefined,
        parsingMethod:
            typeof resume.parsingMethod === "string"
                ? (resume.parsingMethod as ParsedResumeData["parsingMethod"])
                : undefined,
    };
};
