"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import { HeaderSection } from "./components/HeaderSection";
import { ResumeUpload } from "./components/ResumeUpload";
import { UploadedFile } from "@/types/file";
import { formatFileSize } from "@/utils/fileHelpers";
import { MediaUpload } from "./components/MediaUpload";
import { VideoUpload } from "./components/VideoUpload";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import {
    createManualResumeTemplate,
    MANUAL_RESUME_SOURCE_KEY,
} from "@/utils/resume/manualResumeTemplate";

const UploadPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    /**
     * STATE: Global zustand store for portfolio creation
     *
     * Holds all state related to the portfolio being created, including:
     * - Selected template ID
     * - Uploaded resume, media, and video files
     * - AI prompt and generated preview HTML
     *
     * Provides functions to update each piece of state.
     */
    const {
        templateId,

        setTemplateId,
        setPortfolioId,
        setResumeFile,
        setParsedResumeData,
        setParsedResumeSourceKey,
        setIsParsingResume,
        setParsingError,
        addMediaFiles,
        removeMediaFile,
        updateMediaFileSectionHint,
        addVideoFiles,
        removeVideoFile,
        updateVideoFileSectionHint,
    } = usePortfolioStore();

    useEffect(() => {
        const id = searchParams.get("templateId");
        const portfolioId = searchParams.get("portfolioId");
        if (id) setTemplateId(id);
        if (portfolioId) setPortfolioId(portfolioId);
    }, [searchParams, setTemplateId, setPortfolioId]);

    useEffect(() => {
        const portfolioId = searchParams.get("portfolioId");
        if (!portfolioId) return;
        fetch(`/api/portfolio/${portfolioId}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_step: "upload" }),
        }).catch(() => null);
    }, [searchParams]);

    useEffect(() => {
        const portfolioId = searchParams.get("portfolioId");
        if (!portfolioId) return;
        if (templateId) return;

        const loadTemplateId = async () => {
            try {
                const res = await fetch(`/api/portfolio/${portfolioId}/load`);
                if (!res.ok) return;
                const data = await res.json();
                if (data?.templateId) {
                    setTemplateId(data.templateId);
                }
            } catch {
                return;
            }
        };

        loadTemplateId();
    }, [searchParams, templateId, setTemplateId]);

    useEffect(() => {
        const unsub = usePortfolioStore.subscribe((state, prevState) => {
            console.log("Zustand updated:");
            console.log("Previous:", prevState);
            console.log("Current:", state);
        });
        return () => unsub(); // cleanup on unmount
    }, []);

    const getResumeSourceKey = (file: File) =>
        `${file.name}::${file.size}::${file.type}::${file.lastModified}`;

    /**
     * STATE: Pending media files awaiting metadata input
     *
     * Temporarily stores media files that have just been uploaded but haven't
     * been confirmed yet. When files are uploaded, they go here first, allowing
     * the user to add titles and descriptions before confirming them.
     *
     * - Type: UploadedFile[] (array of file objects)
     * - Initial value: [] (empty array)
     * - Workflow: Upload → pendingMediaFiles → Add metadata → Confirm → mediaFiles
     * - Cleared when user confirms or cancels the pending files
     */
    const [pendingMediaFiles, setPendingMediaFiles] = useState<UploadedFile[]>(
        [],
    );

    /**
     * STATE: Pending video files awaiting metadata input
     *
     * Temporarily stores video files that have just been uploaded but haven't
     * been confirmed yet. When files are uploaded, they go here first, allowing
     * the user to add titles and descriptions before confirming them.
     *
     * - Type: UploadedFile[] (array of file objects)
     * - Initial value: [] (empty array)
     * - Workflow: Upload → pendingVideoFiles → Add metadata → Confirm → videoFiles
     * - Cleared when user confirms or cancels the pending files
     */
    const [pendingVideoFiles, setPendingVideoFiles] = useState<UploadedFile[]>(
        [],
    );

    /**
     * HANDLER: File upload for resume, media, and video files
     *
     * Processes file uploads from the file input elements. This function handles
     * three different types of uploads and routes them to the appropriate state.
     *
     * Behavior by type:
     * - "resume": Directly sets the resume file (only accepts first file) and parses it
     * - "media": Adds files to pendingMediaFiles for metadata collection
     * - "video": Adds files to pendingVideoFiles for metadata collection
     *
     * Process flow:
     * 1. Retrieves files from the input event
     * 2. Converts FileList to an array of UploadedFile objects
     * 3. Initializes title and description as empty strings
     * 4. Routes files to appropriate state based on type
     * 5. Resets the input value to allow re-uploading the same file
     *
     * @param e - File input change event containing the selected files
     * @param type - Category of file: "resume" (single), "media" (multiple), or "video" (multiple)
     * @returns void
     */
    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "resume" | "media" | "video",
    ) => {
        const files = e.target.files;
        if (!files) return;

        // Convert FileList to array and create UploadedFile objects
        const fileArray = Array.from(files).map((file) => ({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            title: "",
            description: "",
        }));

        if (type === "resume") {
            // Resume: directly set the first file (single file upload)
            // Parsing is deferred to handleContinue for immediate navigation
            const resumeUpload = fileArray[0];
            setParsedResumeData(null);
            setParsedResumeSourceKey(null);
            setParsingError(null);
            setIsParsingResume(false);

            setResumeFile(resumeUpload);
        } else if (type === "media") {
            // Media: route to pending state for metadata input
            setPendingMediaFiles(fileArray);
        } else if (type === "video") {
            // Video: route to pending state for metadata input
            setPendingVideoFiles(fileArray);
        }

        // Reset input to allow uploading the same file again if needed
        e.target.value = "";
    };

    /**
     * HANDLER: Remove a file from the confirmed files list
     *
     * Deletes a file from the appropriate state array based on the file type.
     * This function is called when the user clicks the delete (X) button on
     * a file in the confirmed files list.
     *
     * Behavior by type:
     * - "resume": Removes the single resume file (sets to null)
     * - "media": Removes a specific media file at the given index
     * - "video": Removes a specific video file at the given index
     *
     * Uses the filter method to create a new array without the specified file,
     * which maintains immutability and triggers React re-renders.
     *
     * @param type - Category of file to remove: "resume", "media", or "video"
     * @param index - (Optional) Array index of the file to remove (required for media/video)
     * @returns void
     */
    const removeFile = (type: "resume" | "media" | "video", index?: number) => {
        if (type === "resume") {
            // Resume: clear the single file
            setResumeFile(null);
            setParsedResumeData(null);
            setParsedResumeSourceKey(null);
        } else if (type === "media" && index !== undefined) {
            // Media: filter out the file at the specified index
            removeMediaFile(index);
        } else if (type === "video" && index !== undefined) {
            // Video: filter out the file at the specified index
            removeVideoFile(index);
        }
    };

    /**
     * HANDLER: Update title of a pending file awaiting confirmation
     *
     * Updates the title property of a file that is in the pending state (not yet confirmed).
     * This function is called when the user types into the title input field during the
     * metadata collection phase, immediately after file upload.
     *
     * Works with pendingMediaFiles or pendingVideoFiles state, not the confirmed files.
     * Uses map to immutably update only the file at the specified index.
     *
     * @param type - File category: "media" or "video"
     * @param index - Array index of the pending file to update
     * @param title - New title string entered by the user
     * @returns void
     */
    const updatePendingFileTitle = (
        type: "media" | "video",
        index: number,
        title: string,
    ) => {
        if (type === "media") {
            // Update title for pending media file at specified index
            setPendingMediaFiles((prev) =>
                prev.map((file, i) =>
                    i === index ? { ...file, title } : file,
                ),
            );
        } else if (type === "video") {
            // Update title for pending video file at specified index
            setPendingVideoFiles((prev) =>
                prev.map((file, i) =>
                    i === index ? { ...file, title } : file,
                ),
            );
        }
    };

    /**
     * HANDLER: Update section hint of a pending file awaiting confirmation
     */
    const updatePendingFileSectionHint = (
        type: "media" | "video",
        index: number,
        sectionHint: string,
    ) => {
        if (type === "media") {
            setPendingMediaFiles((prev) =>
                prev.map((file, i) =>
                    i === index ? { ...file, sectionHint } : file,
                ),
            );
        } else if (type === "video") {
            setPendingVideoFiles((prev) =>
                prev.map((file, i) =>
                    i === index ? { ...file, sectionHint } : file,
                ),
            );
        }
    };

    /**
     * HANDLER: Update description of a pending file awaiting confirmation
     *
     * Updates the description property of a file in the pending state (not yet confirmed).
     * This function is called when the user types into the description textarea during
     * the metadata collection phase, right after uploading files.
     *
     * Similar to updatePendingFileTitle but for the description field.
     * Works with pendingMediaFiles or pendingVideoFiles state arrays.
     * Uses map to create a new array with only the target file's description updated.
     *
     * @param type - File category: "media" or "video"
     * @param index - Array index of the pending file to update
     * @param description - New description text entered by the user
     * @returns void
     */
    const updatePendingFileDescription = (
        type: "media" | "video",
        index: number,
        description: string,
    ) => {
        if (type === "media") {
            // Update description for pending media file at specified index
            setPendingMediaFiles((prev) =>
                prev.map((file, i) =>
                    i === index ? { ...file, description } : file,
                ),
            );
        } else if (type === "video") {
            // Update description for pending video file at specified index
            setPendingVideoFiles((prev) =>
                prev.map((file, i) =>
                    i === index ? { ...file, description } : file,
                ),
            );
        }
    };

    /**
     * HANDLER: Update section hint of a confirmed file
     */
    const updateFileSectionHint = (
        type: "media" | "video",
        index: number,
        sectionHint: string,
    ) => {
        if (type === "media") {
            updateMediaFileSectionHint(index, sectionHint);
        } else if (type === "video") {
            updateVideoFileSectionHint(index, sectionHint);
        }
    };

    /**
     * HANDLER: Confirm and finalize pending files
     *
     * Moves files from the pending state to the confirmed state after the user
     * has added metadata (title and description) and clicked the "Confirm" button.
     *
     * Process flow:
     * 1. Appends all pending files to the confirmed files array using spread operator
     * 2. Clears the pending files array, hiding the metadata input form
     * 3. Shows the confirmed files in the list view
     *
     * This creates a two-step upload process:
     * - Step 1: Upload files → pending state (user adds metadata)
     * - Step 2: Confirm → confirmed state (files appear in final list)
     *
     * @param type - File category to confirm: "media" or "video"
     * @returns void
     */
    const confirmPendingFiles = (type: "media" | "video") => {
        if (type === "media") {
            // Append pending media files to confirmed media files
            addMediaFiles(pendingMediaFiles);
            // Clear pending media files
            setPendingMediaFiles([]);
        } else if (type === "video") {
            // Append pending video files to confirmed video files
            addVideoFiles(pendingVideoFiles);
            // Clear pending video files
            setPendingVideoFiles([]);
        }
    };

    /**
     * HANDLER: Cancel and discard pending files
     *
     * Discards all pending files without confirming them when the user clicks
     * the "Cancel" button during the metadata input phase.
     *
     * This allows users to abort the upload if they:
     * - Uploaded wrong files
     * - Changed their mind about adding these files
     * - Want to start over with different files
     *
     * The files are removed from pending state, returning the UI to the
     * initial upload state. No files are added to the confirmed list.
     *
     * @param type - File category to cancel: "media" or "video"
     * @returns void
     */
    const cancelPendingFiles = (type: "media" | "video") => {
        if (type === "media") {
            // Clear all pending media files (discards upload)
            setPendingMediaFiles([]);
        } else if (type === "video") {
            // Clear all pending video files (discards upload)
            setPendingVideoFiles([]);
        }
    };

    /**
     * Sends the uploaded resume to the backend for parsing
     * This will extract structured data from the resume (name, email, skills, etc.)
     */
    const parseResume = async (file: File, sourceKey?: string) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/resume/parse", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to parse resume");
        }

        const data = await response.json();
        console.log("Parsed resume data:", data);

        // Store parsed data in Zustand store
        if (data.success && data.data) {
            setParsedResumeData(data.data);
            setParsedResumeSourceKey(
                sourceKey ?? getResumeSourceKey(file),
            );
            console.log("Resume data saved to store");
        }
    };

    /**
     * Fire-and-forget parsing that runs in the background
     * Updates Zustand state when complete/error occurs
     */
    const parseResumeInBackground = async (file: File, sourceKey: string) => {
        try {
            await parseResume(file, sourceKey);
        } catch (error) {
            console.error("Background resume parsing failed:", error);
            setParsingError("Failed to parse resume. Please enter information manually.");
        } finally {
            setIsParsingResume(false);
        }
    };

    // Handler to navigate to next page
    const handleContinue = async () => {
        //  --- Call API Route to update Supbase Database
        // Extract current state values
        try {
            const { templateId, portfolioId, resumeFile, mediaFiles, videoFiles } =
                usePortfolioStore.getState();

            if (!templateId || !portfolioId) {
                alert("Missing template or portfolio. Please go back and try again.");
                return;
            }

            // -- Construct form data to send to API route
            const formData = new FormData();
            formData.append("templateId", templateId);
            formData.append("portfolioId", portfolioId);
            if (resumeFile) {
                formData.append("resumeFile", resumeFile.file);
            }

            mediaFiles.forEach((mediaFile) => {
                formData.append("mediaFiles", mediaFile.file);
            });

            videoFiles.forEach((videoFile) => {
                formData.append("videoFiles", videoFile.file);
            });

            const mediaMeta = mediaFiles.map((mediaFile) => ({
                title: mediaFile.title ?? "",
                description: mediaFile.description ?? "",
                sectionHint: mediaFile.sectionHint ?? "",
            }));

            const videoMeta = videoFiles.map((videoFile) => ({
                title: videoFile.title ?? "",
                description: videoFile.description ?? "",
                sectionHint: videoFile.sectionHint ?? "",
            }));

            formData.append("mediaMeta", JSON.stringify(mediaMeta));
            formData.append("videoMeta", JSON.stringify(videoMeta));

            // -- Call the API route to create portfolio
            const res = await fetch("/api/portfolio/create", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("API Error:", error);
                alert("Upload failes: " + error.error);
                return;
            }

            const data = await res.json();
            console.log("UPLOADED RESPONSE: ", data);

            const createdPortfolioId = data.portfolio?.id ?? data.portfolioId;

            if (!createdPortfolioId) {
                alert("Portfolio ID missing from response");
                return;
            }

            // Save portfolio ID to Zustand store for later use
            setPortfolioId(createdPortfolioId);

            // -- Fire-and-forget resume parsing (don't await)
            // Start parsing in background if not already parsed
            if (resumeFile) {
                const resumeSourceKey = getResumeSourceKey(resumeFile.file);
                setIsParsingResume(true);
                setParsingError(null);
                // Fire and forget - don't await
                parseResumeInBackground(resumeFile.file, resumeSourceKey);
            } else {
                setParsedResumeData(createManualResumeTemplate());
                setParsedResumeSourceKey(MANUAL_RESUME_SOURCE_KEY);
                setParsingError(null);
            }

            // -- Navigate IMMEDIATELY - don't wait for parsing
            router.push(
                `/dashboard/create/review?portfolioId=${createdPortfolioId}`,
            );
        } catch (error) {
            console.error("Error during portfolio creation:", error);
            alert(
                "An error occurred while creating the portfolio. Please try again.",
            );
            return;
        }
    };

    // Handler to skip upload and navigate to next page
    const handleSkip = () => {
        const { portfolioId } = usePortfolioStore.getState();
        if (portfolioId) {
            fetch(`/api/portfolio/${portfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ last_step: "refine" }),
            }).catch(() => null);
        }
        router.push(`/dashboard/create/refine?portfolioId=${portfolioId}`);
    };

    return (
        <div className="relative min-h-screen px-4 py-8 pb-32 md:px-6">
            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <HeaderSection />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)] min-h-[800px]">
                    {/* Left Column - Resume Upload (Full Height) */}
                    <ResumeUpload
                        handleFileUpload={handleFileUpload}
                        formatFileSize={formatFileSize}
                        removeFile={removeFile}
                    />

                    {/* Right Column - Media and Video Uploads Stacked */}
                    <div className="flex flex-col gap-6 h-full">
                        {/* Media Files Upload */}
                        <MediaUpload
                            pendingMediaFiles={pendingMediaFiles}
                            updatePendingFileTitle={updatePendingFileTitle}
                            updatePendingFileDescription={
                                updatePendingFileDescription
                            }
                            updatePendingFileSectionHint={
                                updatePendingFileSectionHint
                            }
                            cancelPendingFiles={cancelPendingFiles}
                            confirmPendingFiles={confirmPendingFiles}
                            handleFileUpload={handleFileUpload}
                            updateFileSectionHint={updateFileSectionHint}
                        />

                        {/* Video Files Upload */}
                        <VideoUpload
                            pendingVideoFiles={pendingVideoFiles}
                            updatePendingFileTitle={updatePendingFileTitle}
                            updatePendingFileDescription={
                                updatePendingFileDescription
                            }
                            updatePendingFileSectionHint={
                                updatePendingFileSectionHint
                            }
                            cancelPendingFiles={cancelPendingFiles}
                            confirmPendingFiles={confirmPendingFiles}
                            handleFileUpload={handleFileUpload}
                            updateFileSectionHint={updateFileSectionHint}
                        />
                    </div>
                </div>

                {/* Continue/Skip Buttons */}
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                        }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="flex items-center gap-4">
                            {/* Skip Button */}
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    boxShadow:
                                        "0 0 25px rgba(255, 255, 255, 0.15)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                                onClick={handleSkip}
                                className="hover:cursor-pointer px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/20 text-white/90 rounded-full font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                Skip for now
                            </motion.button>

                            {/* Continue Button */}
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    backgroundColor:
                                        "rgba(255, 255, 255, 0.15)",
                                    boxShadow:
                                        "0 0 40px rgba(255, 255, 255, 0.25)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                                onClick={handleContinue}
                                className="hover:cursor-pointer px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-3"
                            >
                                Continue to revise/edit
                                <FiArrowRight className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UploadPage;
