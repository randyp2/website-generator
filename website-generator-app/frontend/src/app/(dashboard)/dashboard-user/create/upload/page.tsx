"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import { HeaderSection } from "./components/HeaderSection";
import { ResumeUpload } from "./components/ResumeUpload";
import { UploadedFile } from "@/types/file";
import { MediaUpload } from "./components/MediaUpload";
import { VideoUpload } from "./components/VideoUpload";
import { usePortfolioStore } from "@/stores/usePortfolioStore";

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
        setTemplateId,
        setPortfolioId,
        addMediaFiles,
        updateMediaFileSectionHint,
        addVideoFiles,
        updateVideoFileSectionHint,
    } = usePortfolioStore();

    useEffect(() => {
        const id = searchParams.get("templateId");
        const portfolioId = searchParams.get("portfolioId");
        if (id) setTemplateId(id);
        if (portfolioId) setPortfolioId(portfolioId);
    }, [searchParams, setTemplateId, setPortfolioId]);

    // No backend calls - template/portfolio IDs come from query params and zustand store

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
     * - "resume": Disabled in mock mode
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

        if (type === "resume") {
            e.target.value = "";
            return;
        }

        // Convert FileList to array and create UploadedFile objects
        const fileArray = Array.from(files).map((file) => ({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            title: "",
            description: "",
        }));

        if (type === "media") {
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

    // Navigate to review page. Review already seeds a manual mock resume template.
    const handleContinue = () => {
        const { portfolioId } = usePortfolioStore.getState();

        router.push(
            `/dashboard-user/create/review?portfolioId=${portfolioId}`,
        );
    };

    // Skip the disabled resume step and continue to review
    const handleSkip = () => {
        const { portfolioId } = usePortfolioStore.getState();
        router.push(`/dashboard-user/create/review?portfolioId=${portfolioId}`);
    };

    return (
        <div className="upload-flow-page relative min-h-screen px-4 py-8 pb-32 md:px-6">
            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <HeaderSection />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 gap-6 h-[calc(100vh-280px)] min-h-[800px] lg:grid-cols-2">
                    {/* Left Column - Resume Upload (Full Height) */}
                    <ResumeUpload />

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
                                className="upload-ghost-button hover:cursor-pointer rounded-full px-6 py-3 font-semibold"
                            >
                                Skip resume
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
                                className="upload-primary-button hover:cursor-pointer flex items-center gap-3 rounded-full px-8 py-4 font-bold"
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
