import type { ParsedResumeData } from "@/types/resume";

export const MANUAL_RESUME_SOURCE_KEY = "manual-template";

export const createManualResumeTemplate = (): ParsedResumeData => ({
    normalizedText: "",
    fullName: "Your Name",
    email: "you@example.com",
    phone: "(555) 123-4567",
    location: "City, State",
    summary:
        "Write 2-4 sentences about the kind of work you do, the problems you solve, and the impact you want this portfolio to emphasize.",
    skills: [
        "Primary skill or tool",
        "Another strength",
        "Industry expertise",
    ],
    experiences: [
        {
            rawBlock: "",
            title: "Your Role Title",
            company: "Company or Client",
            startDate: "Start Date",
            endDate: "End Date or Present",
            location: "Remote or City, State",
            bullets: [
                "Describe a measurable result, project, or responsibility.",
                "Add a second point that shows ownership, impact, or collaboration.",
            ],
        },
    ],
    projects: [
        {
            rawBlock: "",
            header: "Featured Project",
            bullets: [
                "Explain what you built, why it mattered, and what makes it worth showing.",
            ],
            link: "https://your-project-link.com",
        },
    ],
    educations: [
        {
            institution: "School or Program",
            degree: "Degree, Certification, or Course",
            startDate: "Start Date",
            endDate: "Graduation Date",
            gpa: "",
            awards: "",
            courseWork: "",
        },
    ],
    parsingMethod: "manual_template",
});

const normalizeValue = (value: string | null | undefined) => (value ?? "").trim();

const normalizeList = (values: Array<string | null | undefined> | null | undefined) =>
    (values ?? []).map((value) => normalizeValue(value));

export const isPristineManualResumeTemplate = (
    resume: ParsedResumeData | null | undefined,
): boolean => {
    if (!resume) return false;

    const template = createManualResumeTemplate();

    if (resume.parsingMethod !== "manual_template") {
        return false;
    }

    const summaryMatches =
        normalizeValue(resume.summary) === normalizeValue(template.summary);
    const basicFieldsMatch =
        normalizeValue(resume.fullName) === normalizeValue(template.fullName) &&
        normalizeValue(resume.email) === normalizeValue(template.email) &&
        normalizeValue(resume.phone) === normalizeValue(template.phone) &&
        normalizeValue(resume.location) === normalizeValue(template.location) &&
        normalizeValue(resume.normalizedText) === normalizeValue(template.normalizedText);

    const skillsMatch =
        JSON.stringify(normalizeList(resume.skills)) ===
        JSON.stringify(normalizeList(template.skills));

    const resumeExperience = resume.experiences?.[0];
    const templateExperience = template.experiences[0];
    const experiencesMatch =
        (resume.experiences?.length ?? 0) === 1 &&
        normalizeValue(resumeExperience?.title) === normalizeValue(templateExperience.title) &&
        normalizeValue(resumeExperience?.company) === normalizeValue(templateExperience.company) &&
        normalizeValue(resumeExperience?.startDate) === normalizeValue(templateExperience.startDate) &&
        normalizeValue(resumeExperience?.endDate) === normalizeValue(templateExperience.endDate) &&
        normalizeValue(resumeExperience?.location) === normalizeValue(templateExperience.location) &&
        JSON.stringify(normalizeList(resumeExperience?.bullets)) ===
            JSON.stringify(normalizeList(templateExperience.bullets));

    const resumeProject = resume.projects?.[0];
    const templateProject = template.projects[0];
    const projectsMatch =
        (resume.projects?.length ?? 0) === 1 &&
        normalizeValue(resumeProject?.header) === normalizeValue(templateProject.header) &&
        normalizeValue(resumeProject?.link) === normalizeValue(templateProject.link) &&
        JSON.stringify(normalizeList(resumeProject?.bullets)) ===
            JSON.stringify(normalizeList(templateProject.bullets));

    const resumeEducation = resume.educations?.[0];
    const templateEducation = template.educations[0];
    const educationsMatch =
        (resume.educations?.length ?? 0) === 1 &&
        normalizeValue(resumeEducation?.institution) === normalizeValue(templateEducation.institution) &&
        normalizeValue(resumeEducation?.degree) === normalizeValue(templateEducation.degree) &&
        normalizeValue(resumeEducation?.startDate) === normalizeValue(templateEducation.startDate) &&
        normalizeValue(resumeEducation?.endDate) === normalizeValue(templateEducation.endDate) &&
        normalizeValue(resumeEducation?.gpa) === normalizeValue(templateEducation.gpa) &&
        normalizeValue(resumeEducation?.awards) === normalizeValue(templateEducation.awards) &&
        normalizeValue(resumeEducation?.courseWork) === normalizeValue(templateEducation.courseWork);

    return (
        summaryMatches &&
        basicFieldsMatch &&
        skillsMatch &&
        experiencesMatch &&
        projectsMatch &&
        educationsMatch
    );
};
