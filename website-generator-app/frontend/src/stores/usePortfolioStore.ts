import { UploadedFile } from "@/types/file";
import { create } from "zustand";



/* ========== SHAPE OF ZUSTAND STORE ========== */
export interface PortfolioCreateState {

    // Which template user chose:
    templateId: string | null;

    // Uploaded files 
    resumeFile: UploadedFile | null;
    mediaFiles: UploadedFile[];
    videoFiles: UploadedFile[];

    // AI-related info
    aiPrompt: string;          // Prompt user types in for refinement
    previewHtml: string | null; // Generated preview from AI

    // --- Function definitions to update state
    setTemplateId: (templateId: string | null) => void;

    setResumeFile: (file: UploadedFile | null) => void;

    addMediaFiles: (file: UploadedFile[]) => void;
    removeMediaFile: (index: number) => void;
    updateMediaFileTitle: (index: number, title: string) => void;
    updateMediaFileDescription: (index: number, description: string) => void;

    addVideoFiles: (files: UploadedFile[]) => void;
    removeVideoFile: (index: number) => void;
    updateVideoFileTitle: (index: number, title: string) => void;
    updateVideoFileDescription: (index: number, description: string) => void;



    setAiPrompt: (prompt: string) => void;
    setPreviewHtml: (html: string) => void;
    reset: () => void;
}

/* ========== ZUSTAND STORE ========== */
export const usePortfolioStore = create<PortfolioCreateState>((set, get) => ({


    /* -------- INITIAL STATE VALUES  -------- */
    templateId: null,
    resumeFile: null,
    mediaFiles: [],
    videoFiles: [],
    aiPrompt: "",
    previewHtml: null,


    /* -------- FUNCTION IMPLEMENTATIONS TO UPDATE STATE -------- */
    // Set selected template ID
    setTemplateId: (templateId: string | null) => set({ templateId }),

    // Set resume files
    setResumeFile: (file: UploadedFile | null) => set({ resumeFile: file }),

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
    reset: () => {
        set({
            templateId: null,
            resumeFile: null,
            mediaFiles: [],
            videoFiles: [],
            aiPrompt: "",
            previewHtml: null,
        })
    }

}));
