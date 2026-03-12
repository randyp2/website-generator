"use client";

import type { UploadedFile } from "@/types/file";

interface UseRefineUploadsParams {
    mediaFiles: UploadedFile[];
    videoFiles: UploadedFile[];
    addMediaFiles: (files: UploadedFile[]) => void;
    addVideoFiles: (files: UploadedFile[]) => void;
    removeMediaFile: (index: number) => void;
    removeVideoFile: (index: number) => void;
}

interface UseRefineUploadsResult {
    uploadedFiles: UploadedFile[];
    handleFileSelect: (files: FileList | null) => void;
    removeFile: (index: number) => void;
}

export const useRefineUploads = ({
    mediaFiles,
    videoFiles,
    addMediaFiles,
    addVideoFiles,
    removeMediaFile,
    removeVideoFile,
}: UseRefineUploadsParams): UseRefineUploadsResult => {
    const uploadedFiles = [...mediaFiles, ...videoFiles];

    const handleFileSelect = (files: FileList | null): void => {
        if (!files) return;

        Array.from(files).forEach((file) => {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");

            if (!isImage && !isVideo) return;

            const newUploadedFile: UploadedFile = {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                title: "",
                description: "",
            };

            if (isImage) {
                addMediaFiles([newUploadedFile]);
                return;
            }

            addVideoFiles([newUploadedFile]);
        });
    };

    const removeFile = (index: number): void => {
        if (index < mediaFiles.length) {
            removeMediaFile(index);
            return;
        }

        const videoIndex = index - mediaFiles.length;
        removeVideoFile(videoIndex);
    };

    return {
        uploadedFiles,
        handleFileSelect,
        removeFile,
    };
};
