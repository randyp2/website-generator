import type {
    ParsedEducation,
    ParsedExperience,
    ParsedProject,
    ParsedResumeData,
} from "@/types/resume";

const AGENT_RESUME_CONTEXT_LIMIT = 3400;

type ResumeParseResponse = {
    success?: boolean;
    data?: ParsedResumeData;
    error?: string;
};

type ResumeFlowInput = {
    fileName: string;
    parsedResume: ParsedResumeData;
};

const compact = (value?: string | null): string | null => {
    const normalized = value?.trim();
    return normalized ? normalized : null;
};

const joinOrFallback = (values: Array<string | null>, fallback: string): string =>
    values.filter(Boolean).join(", ") || fallback;

const formatBullets = (bullets?: string[] | null, limit = 2): string =>
    bullets?.filter(Boolean).slice(0, limit).join("; ") ?? "";

const formatExperience = (experience: ParsedExperience): string => {
    const role = joinOrFallback(
        [compact(experience.title), compact(experience.company)],
        "Experience",
    );
    const bullets = formatBullets(experience.bullets);
    return bullets ? `${role}: ${bullets}` : role;
};

const formatProject = (project: ParsedProject): string => {
    const header = compact(project.header) ?? "Project";
    const bullets = formatBullets(project.bullets);
    return bullets ? `${header}: ${bullets}` : header;
};

const formatEducation = (education: ParsedEducation): string =>
    joinOrFallback(
        [compact(education.degree), compact(education.institution)],
        "Education",
    );

const trimForAgentTurn = (message: string): string => {
    if (message.length <= AGENT_RESUME_CONTEXT_LIMIT) {
        return message;
    }

    return `${message.slice(0, AGENT_RESUME_CONTEXT_LIMIT - 80).trim()}\n\n[Resume summary truncated for chat turn limit.]`;
};

const readErrorMessage = async (
    response: Response,
    fallback: string,
): Promise<string> => {
    const body = (await response.json().catch(() => null)) as
        | { error?: unknown; message?: unknown }
        | null;

    if (typeof body?.error === "string" && body.error.trim()) {
        return body.error;
    }
    if (typeof body?.message === "string" && body.message.trim()) {
        return body.message;
    }
    return fallback;
};

export const parseResumeForAgent = async (
    file: File,
): Promise<ParsedResumeData> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(
            await readErrorMessage(response, "Failed to parse resume."),
        );
    }

    const payload = (await response.json()) as ResumeParseResponse;
    if (!payload.success || !payload.data) {
        throw new Error(payload.error ?? "Resume parser returned no data.");
    }

    return payload.data;
};

export const persistPortfolioResume = async (
    portfolioId: string,
    parsedResume: ParsedResumeData,
): Promise<void> => {
    const response = await fetch(
        `/api/portfolio/${encodeURIComponent(portfolioId)}/resume`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                parsedJson: parsedResume,
                extractedText: parsedResume.normalizedText ?? null,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(
            await readErrorMessage(
                response,
                "Failed to save parsed resume to portfolio.",
            ),
        );
    }
};

export const buildAgentResumeContextMessage = ({
    fileName,
    parsedResume,
}: ResumeFlowInput): string => {
    const skills = parsedResume.skills?.filter(Boolean).slice(0, 18) ?? [];
    const experiences =
        parsedResume.experiences?.slice(0, 4).map(formatExperience) ?? [];
    const projects = parsedResume.projects?.slice(0, 5).map(formatProject) ?? [];
    const educations =
        parsedResume.educations?.slice(0, 3).map(formatEducation) ?? [];

    return trimForAgentTurn(
        [
            `I uploaded and parsed my resume file "${fileName}". Use this parsed resume as the content foundation before visual styling.`,
            `Name: ${compact(parsedResume.fullName) ?? "Not provided"}`,
            `Location: ${compact(parsedResume.location) ?? "Not provided"}`,
            `Summary: ${compact(parsedResume.summary) ?? "Not provided"}`,
            `Skills: ${skills.length ? skills.join(", ") : "Not provided"}`,
            `Experience: ${experiences.length ? experiences.join(" | ") : "Not provided"}`,
            `Projects: ${projects.length ? projects.join(" | ") : "Not provided"}`,
            `Education: ${educations.length ? educations.join(" | ") : "Not provided"}`,
            `Parsing method: ${parsedResume.parsingMethod ?? "unknown"}; confidence: ${parsedResume.confidenceScore ?? "unknown"}`,
            "Next: identify the strongest portfolio priorities from this resume before moving into style.",
        ].join("\n"),
    );
};
