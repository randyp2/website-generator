import { UploadedFile } from "@/types/file";
import type { Message } from "@/types/preview";
import {
    ParsedResumeData,
    ParsedExperience,
    ParsedEducation,
    ParsedProject,
} from "@/types/resume";
import { StylePreferences } from "@/types/style";
import type { SectionDTO, GlobalTheme } from "@/types/portfolio";
import { normalizeParsedResumeData } from "@/utils/resume/normalizeParsedResumeData";
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
    parsedResumeSourceKey: string | null;

    // Resume parsing state
    isParsingResume: boolean;
    parsingError: string | null;

    // Style preferences
    stylePreferences: StylePreferences;
    isSendingStyle: boolean;

    // Generated sections for preview
    sections: SectionDTO[] | null;

    // Global theme for unified backgrounds
    globalTheme: GlobalTheme | null;

    // Chat messages (persisted for preview page)
    messages: Message[];
    styleMessages: Message[];

    // Chat layout mode for preview page
    chatLayoutMode: 'sidebar' | 'floating' | 'preview';

    // AI-related info
    aiPrompt: string; // Prompt user types in for refinement
    previewHtml: string | null; // Generated preview from AI
    refineSessionId: string | null; // Clarifier session for the current refinement conversation

    // --- Function definitions to update state
    setTemplateId: (templateId: string | null) => void;
    setPortfolioId: (portfolioId: string | null) => void;

    setResumeFile: (file: UploadedFile | null) => void;
    setParsedResumeData: (data: ParsedResumeData | null) => void;
    setParsedResumeSourceKey: (key: string | null) => void;
    setIsParsingResume: (isParsing: boolean) => void;
    setParsingError: (error: string | null) => void;

    addMediaFiles: (file: UploadedFile[]) => void;
    removeMediaFile: (index: number) => void;
    updateMediaFileTitle: (index: number, title: string) => void;
    updateMediaFileDescription: (index: number, description: string) => void;
    updateMediaFileSectionHint: (index: number, sectionHint: string) => void;

    addVideoFiles: (files: UploadedFile[]) => void;
    removeVideoFile: (index: number) => void;
    updateVideoFileTitle: (index: number, title: string) => void;
    updateVideoFileDescription: (index: number, description: string) => void;
    updateVideoFileSectionHint: (index: number, sectionHint: string) => void;

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
    addExperience: () => void;
    removeExperience: (index: number) => void;
    updateExperience: (
        index: number,
        field: keyof ParsedExperience,
        value: ParsedExperience[keyof ParsedExperience],
    ) => void;
    updateExperienceBullet: (
        expIndex: number,
        bulletIndex: number,
        value: string,
    ) => void;
    addExperienceBullet: (expIndex: number) => void;
    removeExperienceBullet: (expIndex: number, bulletIndex: number) => void;

    // Education management
    updateEducation: (
        index: number,
        field: keyof ParsedEducation,
        value: ParsedEducation[keyof ParsedEducation],
    ) => void;

    // Project management
    updateProject: (
        index: number,
        field: keyof ParsedProject,
        value: ParsedProject[keyof ParsedProject],
    ) => void;

    // Style preferences management
    setStylePreferences: (prefs: StylePreferences) => void;
    updateStylePreference: (key: keyof StylePreferences, value: string) => void;
    setIsSendingStyle: (isSending: boolean) => void;

    setSections: (sections: SectionDTO[] | null) => void;
    appendSections: (newSections: SectionDTO[]) => void;
    setGlobalTheme: (theme: GlobalTheme | null) => void;

    setMessages: (
        updater: Message[] | ((prev: Message[]) => Message[]),
    ) => void;
    setStyleMessages: (
        updater: Message[] | ((prev: Message[]) => Message[]),
    ) => void;

    setChatLayoutMode: (mode: 'sidebar' | 'floating' | 'preview') => void;

    setAiPrompt: (prompt: string) => void;
    setPreviewHtml: (html: string) => void;
    setRefineSessionId: (sessionId: string | null) => void;
    reset: () => void;
}

/* ========== ZUSTAND STORE ========== */
/** One-shot guard so a persistent rehydration failure never retry-loops. */
let hasAttemptedStoreRecovery = false;

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
            parsedResumeSourceKey: null,
            isParsingResume: false,
            parsingError: null,
            stylePreferences: {
                colorScheme: null,
                layoutDensity: null,
                tone: null,
                visualStyle: null,
                sectionEmphasis: null,
                typography: null,
                animationStyle: null,
                whitespace: null,
                visualRichness: null,
                interactiveElements: null,
                customNotes: "",
            },
            isSendingStyle: false,
            sections: null,
            globalTheme: null,
            messages: [],
            styleMessages: [],
            chatLayoutMode: 'sidebar',
            aiPrompt: "",
            previewHtml: null,
            refineSessionId: null,

            /* -------- FUNCTION IMPLEMENTATIONS TO UPDATE STATE -------- */
            // Set selected template ID
            setTemplateId: (templateId: string | null) => set({ templateId }),

            // Set portfolio ID
            setPortfolioId: (portfolioId: string | null) =>
                set({ portfolioId }),

            // Set resume files
            setResumeFile: (file: UploadedFile | null) =>
                set({ resumeFile: file }),

            // Set parsed resume data
            setParsedResumeData: (data: ParsedResumeData | null) =>
                set({ parsedResumeData: normalizeParsedResumeData(data) }),

            setParsedResumeSourceKey: (key: string | null) =>
                set({ parsedResumeSourceKey: key }),

            setIsParsingResume: (isParsing: boolean) =>
                set({ isParsingResume: isParsing }),

            setParsingError: (error: string | null) =>
                set({ parsingError: error }),

            // Add/Remove media files & Update titles and descriptions
            addMediaFiles: (files: UploadedFile[]) => {
                const current: UploadedFile[] = get().mediaFiles; // Get current media files
                set({ mediaFiles: [...current, ...files] }); // Append new files
            },
            removeMediaFile: (index: number) => {
                const current: UploadedFile[] = get().mediaFiles;
                const updatedMediaFiles: UploadedFile[] = current.filter(
                    (_, i) => i !== index,
                );
                set({ mediaFiles: updatedMediaFiles });
            },
            updateMediaFileTitle: (index: number, title: string) => {
                const current = get().mediaFiles;
                const updatedMediaFiles = current.map((file, i) =>
                    i === index ? { ...file, title } : file,
                );
                set({ mediaFiles: updatedMediaFiles });
            },
            updateMediaFileDescription: (
                index: number,
                description: string,
            ) => {
                const current = get().mediaFiles;
                const updatedMediaFiles = current.map((file, i) =>
                    i === index ? { ...file, description } : file,
                );
                set({ mediaFiles: updatedMediaFiles });
            },
            updateMediaFileSectionHint: (
                index: number,
                sectionHint: string,
            ) => {
                const current = get().mediaFiles;
                const updatedMediaFiles = current.map((file, i) =>
                    i === index ? { ...file, sectionHint } : file,
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
                const updatedVideoFiles: UploadedFile[] = current.filter(
                    (_, i) => i !== index,
                );
                set({ videoFiles: updatedVideoFiles });
            },
            updateVideoFileTitle: (index: number, title: string) => {
                const current = get().videoFiles;
                const updatedVideoFiles = current.map((file, i) =>
                    i === index ? { ...file, title } : file,
                );
                set({ videoFiles: updatedVideoFiles });
            },
            updateVideoFileDescription: (
                index: number,
                description: string,
            ) => {
                const current = get().videoFiles;
                const updatedVideoFiles = current.map((file, i) =>
                    i === index ? { ...file, description } : file,
                );
                set({ videoFiles: updatedVideoFiles });
            },
            updateVideoFileSectionHint: (
                index: number,
                sectionHint: string,
            ) => {
                const current = get().videoFiles;
                const updatedVideoFiles = current.map((file, i) =>
                    i === index ? { ...file, sectionHint } : file,
                );
                set({ videoFiles: updatedVideoFiles });
            },

            // Set AI-related info
            setPreviewHtml: (html: string) => set({ previewHtml: html }),
            setAiPrompt: (prompt: string) => set({ aiPrompt: prompt }),
            setRefineSessionId: (sessionId: string | null) =>
                set({ refineSessionId: sessionId }),

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
                    const updatedSkills = [...(current.skills ?? []), ""];
                    set({
                        parsedResumeData: { ...current, skills: updatedSkills },
                    });
                }
            },

            updateSkill: (index: number, skill: string) => {
                const current = get().parsedResumeData;
                if (current) {
                    const updatedSkills = (current.skills ?? []).map((s, i) =>
                        i === index ? skill : s,
                    );
                    set({
                        parsedResumeData: { ...current, skills: updatedSkills },
                    });
                }
            },

            removeSkill: (index: number) => {
                const current = get().parsedResumeData;
                if (current) {
                    const updatedSkills = (current.skills ?? []).filter(
                        (_, i) => i !== index,
                    );
                    set({
                        parsedResumeData: { ...current, skills: updatedSkills },
                    });
                }
            },

            // Experience management
            addExperience: () => {
                const current = get().parsedResumeData;
                if (current) {
                    set({
                        parsedResumeData: {
                            ...current,
                            experiences: [
                                ...(current.experiences ?? []),
                                {
                                    rawBlock: "",
                                    title: "",
                                    company: "",
                                    startDate: "",
                                    endDate: "",
                                    location: "",
                                    bullets: [""],
                                },
                            ],
                        },
                    });
                }
            },

            removeExperience: (index: number) => {
                const current = get().parsedResumeData;
                if (current) {
                    set({
                        parsedResumeData: {
                            ...current,
                            experiences: (current.experiences ?? []).filter(
                                (_, experienceIndex) => experienceIndex !== index,
                            ),
                        },
                    });
                }
            },

            updateExperience: (
                index: number,
                field: keyof ParsedExperience,
                value: ParsedExperience[keyof ParsedExperience],
            ) => {
                const current = get().parsedResumeData;
                if (current) {
                    const updatedExperiences = (current.experiences ?? []).map(
                        (exp, i) =>
                            i === index ? { ...exp, [field]: value } : exp,
                    );
                    set({
                        parsedResumeData: {
                            ...current,
                            experiences: updatedExperiences,
                        },
                    });
                }
            },

            updateExperienceBullet: (
                expIndex: number,
                bulletIndex: number,
                value: string,
            ) => {
                const current = get().parsedResumeData;
                if (current) {
                    const updatedExperiences = (current.experiences ?? []).map(
                        (exp, i) =>
                            i === expIndex
                                ? {
                                      ...exp,
                                      bullets: (exp.bullets ?? []).map((b, j) =>
                                          j === bulletIndex ? value : b,
                                      ),
                                  }
                                : exp,
                    );
                    set({
                        parsedResumeData: {
                            ...current,
                            experiences: updatedExperiences,
                        },
                    });
                }
            },

            addExperienceBullet: (expIndex: number) => {
                const current = get().parsedResumeData;
                if (current) {
                    const updatedExperiences = (current.experiences ?? []).map(
                        (exp, i) =>
                            i === expIndex
                                ? { ...exp, bullets: [...(exp.bullets ?? []), ""] }
                                : exp,
                    );
                    set({
                        parsedResumeData: {
                            ...current,
                            experiences: updatedExperiences,
                        },
                    });
                }
            },

            removeExperienceBullet: (expIndex: number, bulletIndex: number) => {
                const current = get().parsedResumeData;
                if (current) {
                    const updatedExperiences = (current.experiences ?? []).map(
                        (exp, i) =>
                            i === expIndex
                                ? {
                                      ...exp,
                                      bullets: (exp.bullets ?? []).filter(
                                          (_, j) => j !== bulletIndex,
                                      ),
                                  }
                                : exp,
                    );
                    set({
                        parsedResumeData: {
                            ...current,
                            experiences: updatedExperiences,
                        },
                    });
                }
            },

            // Education management
            updateEducation: (
                index: number,
                field: keyof ParsedEducation,
                value: ParsedEducation[keyof ParsedEducation],
            ) => {
                const current = get().parsedResumeData;
                if (current) {
                    const updatedEducations = (current.educations ?? []).map(
                        (edu, i) =>
                            i === index ? { ...edu, [field]: value } : edu,
                    );
                    set({
                        parsedResumeData: {
                            ...current,
                            educations: updatedEducations,
                        },
                    });
                }
            },

            // Project management
            updateProject: (
                index: number,
                field: keyof ParsedProject,
                value: ParsedProject[keyof ParsedProject],
            ) => {
                const current = get().parsedResumeData;
                if (current) {
                    const updatedProjects = (current.projects ?? []).map((proj, i) =>
                        i === index ? { ...proj, [field]: value } : proj,
                    );
                    set({
                        parsedResumeData: {
                            ...current,
                            projects: updatedProjects,
                        },
                    });
                }
            },

            // Style preferences management
            setStylePreferences: (prefs: StylePreferences) => {
                set({ stylePreferences: prefs });
            },

            updateStylePreference: (
                key: keyof StylePreferences,
                value: string,
            ) => {
                const current = get().stylePreferences;
                set({ stylePreferences: { ...current, [key]: value } });
            },

            setIsSendingStyle: (isSending: boolean) =>
                set({ isSendingStyle: isSending }),

            setSections: (sections: SectionDTO[] | null) => set({ sections }),
            appendSections: (newSections: SectionDTO[]) => {
                const current = get().sections ?? [];
                set({ sections: [...current, ...newSections] });
            },
            setGlobalTheme: (theme: GlobalTheme | null) => set({ globalTheme: theme }),

            setMessages: (
                updater: Message[] | ((prev: Message[]) => Message[]),
            ) =>
                set((state) => ({
                    messages:
                        typeof updater === "function"
                            ? updater(state.messages)
                            : updater,
                })),

            setStyleMessages: (
                updater: Message[] | ((prev: Message[]) => Message[]),
            ) =>
                set((state) => ({
                    styleMessages:
                        typeof updater === "function"
                            ? updater(state.styleMessages)
                            : updater,
                })),

            setChatLayoutMode: (mode: 'sidebar' | 'floating' | 'preview') =>
                set({ chatLayoutMode: mode }),

            reset: () => {
                set({
                    templateId: null,
                    portfolioId: null,
                    resumeFile: null,
                    mediaFiles: [],
                    videoFiles: [],
                    parsedResumeData: null,
                    parsedResumeSourceKey: null,
                    isParsingResume: false,
                    parsingError: null,
                    sections: null,
                    globalTheme: null,
                    messages: [],
                    styleMessages: [],
                    chatLayoutMode: 'sidebar',
                    stylePreferences: {
                        colorScheme: null,
                        layoutDensity: null,
                        tone: null,
                        visualStyle: null,
                        sectionEmphasis: null,
                        typography: null,
                        animationStyle: null,
                        whitespace: null,
                        visualRichness: null,
                        interactiveElements: null,
                        customNotes: "",
                    },
                    isSendingStyle: false,
                    aiPrompt: "",
                    previewHtml: null,
                    refineSessionId: null,
                });
                // Clear persisted storage when resetting
                sessionStorage.removeItem("portfolio-creation-store");
            },
        }),
        {
            name: "portfolio-creation-store",
            storage: createJSONStorage(() => sessionStorage),
            // Draft/session state is disposable: discard any older schema
            // instead of loading a stale shape into new code. Bump `version`
            // on every change to the persisted shape (partialize fields or
            // their types) and add a case here only if data must survive.
            version: 1,
            migrate: (persistedState, version) =>
                version === 1 ? persistedState : undefined,
            // Corrupt persisted state must never lock the UI: zustand swallows
            // rehydration errors and leaves hasHydrated() false forever, which
            // keeps every hydration-gated input disabled. Recover ONCE by
            // dropping the bad entry and rehydrating with defaults; a second
            // failure means the error is not storage-borne, so retrying again
            // would loop. The retry is deferred because the first hydrate runs
            // synchronously during store creation, before the store const is
            // initialized.
            onRehydrateStorage: () => (_state, error) => {
                if (!error) return;
                console.error(
                    "[portfolio-store] Failed to rehydrate persisted state",
                    error,
                );
                if (hasAttemptedStoreRecovery) return;
                hasAttemptedStoreRecovery = true;
                sessionStorage.removeItem("portfolio-creation-store");
                setTimeout(() => {
                    void usePortfolioStore.persist.rehydrate();
                }, 0);
            },
            partialize: (state) => ({
                // Persist most state, but handle files specially
                templateId: state.templateId,
                portfolioId: state.portfolioId,
                parsedResumeData: state.parsedResumeData,
                parsedResumeSourceKey: state.parsedResumeSourceKey,
                isParsingResume: state.isParsingResume,
                parsingError: state.parsingError,
                stylePreferences: state.stylePreferences,
                sections: state.sections,
                globalTheme: state.globalTheme,
                messages: state.messages,
                styleMessages: state.styleMessages,
                chatLayoutMode: state.chatLayoutMode,
                aiPrompt: state.aiPrompt,
                previewHtml: state.previewHtml,
                refineSessionId: state.refineSessionId,
                // For files, store metadata only (File objects can't be serialized)
                resumeFile: state.resumeFile
                    ? {
                          id: state.resumeFile.id,
                          name: state.resumeFile.name,
                          size: state.resumeFile.size,
                          type: state.resumeFile.type,
                          title: state.resumeFile.title,
                          description: state.resumeFile.description,
                          file: null as unknown as File, // File object will be null after refresh
                      }
                    : null,
                mediaFiles: state.mediaFiles.map((f) => ({
                    id: f.id,
                    name: f.name,
                    size: f.size,
                    type: f.type,
                    title: f.title,
                    description: f.description,
                    file: null as unknown as File,
                })),
                videoFiles: state.videoFiles.map((f) => ({
                    id: f.id,
                    name: f.name,
                    size: f.size,
                    type: f.type,
                    title: f.title,
                    description: f.description,
                    file: null as unknown as File,
                })),
            }),
            // persistedState is undefined when storage is empty (fresh session,
            // or right after reset() removed the entry): fall back to defaults
            merge: (persistedState, currentState) => {
                const persisted = (persistedState ??
                    {}) as Partial<PortfolioCreateState>;

                return {
                    ...currentState,
                    ...persisted,
                    parsedResumeData: normalizeParsedResumeData(
                        persisted.parsedResumeData ?? currentState.parsedResumeData,
                    ),
                };
            },
        },
    ),
);
