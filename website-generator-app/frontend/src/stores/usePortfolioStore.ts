import { UploadedFile } from "@/types/file";
import type { Message } from "@/types/preview";
import { ParsedResumeData, ParsedExperience, ParsedEducation, ParsedProject } from "@/types/resume";
import { StylePreferences } from "@/types/style";
import type { SectionDTO } from "@/types/portfolio";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";



/* ========== SHAPE OF ZUSTAND STORE ========== */
export interface PortfolioCreateState {

    // Which template user chose:
    templateId: string | null;

    // Portfolio ID (set after creation)
    portfolioId: string | null;

    // Uploaded files
    resumeFile: UploadedFile | null;
    mediaFiles: UploadedFile[];
    videoFiles: UploadedFile[];

    // Parsed resume data
    parsedResumeData: ParsedResumeData | null;

    // Style preferences
    stylePreferences: StylePreferences;

    // Generated sections for preview
    sections: SectionDTO[] | null;

    // Chat messages (persisted for preview page)
    messages: Message[];

    // AI-related info
    aiPrompt: string;          // Prompt user types in for refinement
    previewHtml: string | null; // Generated preview from AI

    // --- Function definitions to update state
    setTemplateId: (templateId: string | null) => void;
    setPortfolioId: (portfolioId: string | null) => void;

    setResumeFile: (file: UploadedFile | null) => void;
    setParsedResumeData: (data: ParsedResumeData | null) => void;

    addMediaFiles: (file: UploadedFile[]) => void;
    removeMediaFile: (index: number) => void;
    updateMediaFileTitle: (index: number, title: string) => void;
    updateMediaFileDescription: (index: number, description: string) => void;

    addVideoFiles: (files: UploadedFile[]) => void;
    removeVideoFile: (index: number) => void;
    updateVideoFileTitle: (index: number, title: string) => void;
    updateVideoFileDescription: (index: number, description: string) => void;

    // Parsed resume data update functions
    updateFullName: (fullName: string) => void;
    updateEmail: (email: string) => void;
    updatePhone: (phone: string) => void;
    updateLocation: (location: string) => void;
    updateSummary: (summary: string) => void;

    // Skills management
    addSkill: () => void;
    updateSkill: (index: number, skill: string) => void;
    removeSkill: (index: number) => void;

    // Experience management
    updateExperience: (index: number, field: keyof ParsedExperience, value: any) => void;
    updateExperienceBullet: (expIndex: number, bulletIndex: number, value: string) => void;
    addExperienceBullet: (expIndex: number) => void;
    removeExperienceBullet: (expIndex: number, bulletIndex: number) => void;

    // Education management
    updateEducation: (index: number, field: keyof ParsedEducation, value: any) => void;

    // Project management
    updateProject: (index: number, field: keyof ParsedProject, value: any) => void;

    // Style preferences management
    setStylePreferences: (prefs: StylePreferences) => void;
    updateStylePreference: (key: keyof StylePreferences, value: string) => void;

    setSections: (sections: SectionDTO[] | null) => void;

    setMessages: (
        updater: Message[] | ((prev: Message[]) => Message[]),
    ) => void;

    setAiPrompt: (prompt: string) => void;
    setPreviewHtml: (html: string) => void;
    reset: () => void;
}

/* ========== ZUSTAND STORE ========== */
export const usePortfolioStore = create<PortfolioCreateState>()(
    persist(
        (set, get) => ({
            /* -------- INITIAL STATE VALUES  -------- */
            templateId: null,
            portfolioId: null,
            resumeFile: null,
            mediaFiles: [],
            videoFiles: [],
            parsedResumeData: null,
            stylePreferences: {
                colorScheme: null,
                layoutDensity: null,
                tone: null,
                visualStyle: null,
                sectionEmphasis: null,
                customNotes: ""
            },
            sections: null,
            messages: [],
            aiPrompt: "",
            previewHtml: null,


    /* -------- FUNCTION IMPLEMENTATIONS TO UPDATE STATE -------- */
    // Set selected template ID
    setTemplateId: (templateId: string | null) => set({ templateId }),

    // Set portfolio ID
    setPortfolioId: (portfolioId: string | null) => set({ portfolioId }),

    // Set resume files
    setResumeFile: (file: UploadedFile | null) => set({ resumeFile: file }),

    // Set parsed resume data
    setParsedResumeData: (data: ParsedResumeData | null) => set({ parsedResumeData: data }),

    // Add/Remove media files & Update titles and descriptions
    addMediaFiles: (files: UploadedFile[]) => {
        const current: UploadedFile[] = get().mediaFiles; // Get current media files
        set({ mediaFiles: [...current, ...files] }); // Append new files
    },
    removeMediaFile: (index: number) => {
        const current: UploadedFile[] = get().mediaFiles;
        const updatedMediaFiles: UploadedFile[] = current.filter((_, i) => i !== index);
        set({ mediaFiles: updatedMediaFiles });
    },
    updateMediaFileTitle: (index: number, title: string) => {
        const current = get().mediaFiles;
        const updatedMediaFiles = current.map((file, i) =>
            i === index ? { ...file, title } : file
        );
        set({ mediaFiles: updatedMediaFiles });
    },
    updateMediaFileDescription: (index: number, description: string) => {
        const current = get().mediaFiles;
        const updatedMediaFiles = current.map((file, i) =>
            i === index ? { ...file, description } : file
        );
        set({ mediaFiles: updatedMediaFiles });
    },

    // Add/remove video files & Update titles and descriptions
    addVideoFiles: (files: UploadedFile[]) => {
        const current: UploadedFile[] = get().videoFiles; // Get current video files
        set({ videoFiles: [...current, ...files] }); // Append new files
    },

    removeVideoFile: (index: number) => {
        const current: UploadedFile[] = get().videoFiles;
        const updatedVideoFiles: UploadedFile[] = current.filter((_, i) => i !== index);
        set({ videoFiles: updatedVideoFiles });
    },
    updateVideoFileTitle: (index: number, title: string) => {
        const current = get().videoFiles;
        const updatedVideoFiles = current.map((file, i) =>
            i === index ? { ...file, title } : file
        );
        set({ videoFiles: updatedVideoFiles });
    },
    updateVideoFileDescription: (index: number, description: string) => {
        const current = get().videoFiles;
        const updatedVideoFiles = current.map((file, i) =>
            i === index ? { ...file, description } : file
        );
        set({ videoFiles: updatedVideoFiles });
    },



    // Set AI-related info
    setPreviewHtml: (html: string) => set({ previewHtml: html }),
    setAiPrompt: (prompt: string) => set({ aiPrompt: prompt }),

    // ========== PARSED RESUME DATA UPDATE FUNCTIONS ==========

    // Personal information updates
    updateFullName: (fullName: string) => {
        const current = get().parsedResumeData;
        if (current) {
            set({ parsedResumeData: { ...current, fullName } });
        }
    },

    updateEmail: (email: string) => {
        const current = get().parsedResumeData;
        if (current) {
            set({ parsedResumeData: { ...current, email } });
        }
    },

    updatePhone: (phone: string) => {
        const current = get().parsedResumeData;
        if (current) {
            set({ parsedResumeData: { ...current, phone } });
        }
    },

    updateLocation: (location: string) => {
        const current = get().parsedResumeData;
        if (current) {
            set({ parsedResumeData: { ...current, location } });
        }
    },

    updateSummary: (summary: string) => {
        const current = get().parsedResumeData;
        if (current) {
            set({ parsedResumeData: { ...current, summary } });
        }
    },

    // Skills management
    addSkill: () => {
        const current = get().parsedResumeData;
        if (current) {
            const updatedSkills = [...current.skills, ""];
            set({ parsedResumeData: { ...current, skills: updatedSkills } });
        }
    },

    updateSkill: (index: number, skill: string) => {
        const current = get().parsedResumeData;
        if (current) {
            const updatedSkills = current.skills.map((s, i) => i === index ? skill : s);
            set({ parsedResumeData: { ...current, skills: updatedSkills } });
        }
    },

    removeSkill: (index: number) => {
        const current = get().parsedResumeData;
        if (current) {
            const updatedSkills = current.skills.filter((_, i) => i !== index);
            set({ parsedResumeData: { ...current, skills: updatedSkills } });
        }
    },

    // Experience management
    updateExperience: (index: number, field: keyof ParsedExperience, value: any) => {
        const current = get().parsedResumeData;
        if (current) {
            const updatedExperiences = current.experiences.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            );
            set({ parsedResumeData: { ...current, experiences: updatedExperiences } });
        }
    },

    updateExperienceBullet: (expIndex: number, bulletIndex: number, value: string) => {
        const current = get().parsedResumeData;
        if (current) {
            const updatedExperiences = current.experiences.map((exp, i) =>
                i === expIndex
                    ? {
                        ...exp,
                        bullets: exp.bullets.map((b, j) => j === bulletIndex ? value : b),
                    }
                    : exp
            );
            set({ parsedResumeData: { ...current, experiences: updatedExperiences } });
        }
    },

    addExperienceBullet: (expIndex: number) => {
        const current = get().parsedResumeData;
        if (current) {
            const updatedExperiences = current.experiences.map((exp, i) =>
                i === expIndex
                    ? { ...exp, bullets: [...exp.bullets, ""] }
                    : exp
            );
            set({ parsedResumeData: { ...current, experiences: updatedExperiences } });
        }
    },

    removeExperienceBullet: (expIndex: number, bulletIndex: number) => {
        const current = get().parsedResumeData;
        if (current) {
            const updatedExperiences = current.experiences.map((exp, i) =>
                i === expIndex
                    ? {
                        ...exp,
                        bullets: exp.bullets.filter((_, j) => j !== bulletIndex),
                    }
                    : exp
            );
            set({ parsedResumeData: { ...current, experiences: updatedExperiences } });
        }
    },

    // Education management
    updateEducation: (index: number, field: keyof ParsedEducation, value: any) => {
        const current = get().parsedResumeData;
        if (current) {
            const updatedEducations = current.educations.map((edu, i) =>
                i === index ? { ...edu, [field]: value } : edu
            );
            set({ parsedResumeData: { ...current, educations: updatedEducations } });
        }
    },

    // Project management
    updateProject: (index: number, field: keyof ParsedProject, value: any) => {
        const current = get().parsedResumeData;
        if (current) {
            const updatedProjects = current.projects.map((proj, i) =>
                i === index ? { ...proj, [field]: value } : proj
            );
            set({ parsedResumeData: { ...current, projects: updatedProjects } });
        }
    },

    // Style preferences management
    setStylePreferences: (prefs: StylePreferences) => {
        set({ stylePreferences: prefs });
    },

    updateStylePreference: (key: keyof StylePreferences, value: string) => {
        const current = get().stylePreferences;
        set({ stylePreferences: { ...current, [key]: value } });
    },

    setSections: (sections: SectionDTO[] | null) => set({ sections }),

    setMessages: (updater: Message[] | ((prev: Message[]) => Message[])) =>
        set((state) => ({
            messages:
                typeof updater === "function" ? updater(state.messages) : updater,
        })),

    reset: () => {
        set({
            templateId: null,
            portfolioId: null,
            resumeFile: null,
            mediaFiles: [],
            videoFiles: [],
            parsedResumeData: null,
            sections: null,
            messages: [],
            stylePreferences: {
                colorScheme: null,
                layoutDensity: null,
                tone: null,
                visualStyle: null,
                sectionEmphasis: null,
                customNotes: ""
            },
            aiPrompt: "",
            previewHtml: null,
        });
        // Clear persisted storage when resetting
        sessionStorage.removeItem('portfolio-creation-store');
    }

        }),
        {
            name: 'portfolio-creation-store',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                // Persist most state, but handle files specially
                templateId: state.templateId,
                portfolioId: state.portfolioId,
                parsedResumeData: state.parsedResumeData,
                stylePreferences: state.stylePreferences,
                sections: state.sections,
                messages: state.messages,
                aiPrompt: state.aiPrompt,
                previewHtml: state.previewHtml,
                // For files, store metadata only (File objects can't be serialized)
                resumeFile: state.resumeFile ? {
                    id: state.resumeFile.id,
                    name: state.resumeFile.name,
                    size: state.resumeFile.size,
                    type: state.resumeFile.type,
                    title: state.resumeFile.title,
                    description: state.resumeFile.description,
                    file: null as any, // File object will be null after refresh
                } : null,
                mediaFiles: state.mediaFiles.map(f => ({
                    id: f.id,
                    name: f.name,
                    size: f.size,
                    type: f.type,
                    title: f.title,
                    description: f.description,
                    file: null as any,
                })),
                videoFiles: state.videoFiles.map(f => ({
                    id: f.id,
                    name: f.name,
                    size: f.size,
                    type: f.type,
                    title: f.title,
                    description: f.description,
                    file: null as any,
                })),
            }),
        }
    )
);
