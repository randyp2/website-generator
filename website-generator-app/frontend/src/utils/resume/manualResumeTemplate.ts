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
