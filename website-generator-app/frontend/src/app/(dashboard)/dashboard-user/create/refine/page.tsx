"use client";

import React, { useState } from "react";
import type { UploadedFile } from "@/types/file";
import { Message } from "@/types/preview";
import { Preview } from "./components/Preview";
import { ChatbotOverlay } from "./components/ChatbotOverlay";
import { FloatingPromptBar } from "./components/FloatingPromptBar";
import { ChatHistoryOverlay } from "./components/ChatHistoryOverlay";
import { usePortfolioStore } from "@/stores/usePortfolioStore";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const AIRefinementPage: React.FC = () => {
    // Zustand store - All portfolio creation state
    const {
        previewHtml,
        setPreviewHtml,
        mediaFiles,
        videoFiles,
        addMediaFiles,
        addVideoFiles,
        removeMediaFile,
        removeVideoFile,
    } = usePortfolioStore();

    // Messages & AI response
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Combine media and video files for display
    const uploadedFiles = [...mediaFiles, ...videoFiles];

    // ========================================================================
    // FILE HANDLING
    // ========================================================================
    /**
     * Processes selected files and adds them to the uploadedFiles state.
     * Validates that files are either images or videos before creating preview URLs.
     *
     * @param files - FileList from input element or drag & drop event
     *
     * Process:
     * 1. Checks if files exist, returns early if null
     * 2. Iterates through each file and validates MIME type
     * 3. Creates object URL for preview display
     * 4. Generates random ID for each file
     * 5. Populates FilePreview object with file metadata and preview data
     * 6. Appends validated files to existing uploadedFiles state
     */
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        Array.from(files).forEach((file) => {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");

            if (!isImage && !isVideo) return; // Skip unsupported file types

            const newUploadedFile: UploadedFile = {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                title: "",
                description: "",
            };

            if (isImage) addMediaFiles([newUploadedFile]);
            else if (isVideo) addVideoFiles([newUploadedFile]);
        });
    };

    /**
     * Removes a file from the Zustand store by its index.
     * Determines if the file is a media file (image) or video file, then calls the appropriate remove function.
     *
     * @param index - Index of the file to remove in the combined uploadedFiles array
     */
    const removeFile = (index: number) => {
        // Check if it's within mediaFiles range
        if (index < mediaFiles.length) {
            removeMediaFile(index);
        } else {
            // It's a video file, adjust index to videoFiles array
            const videoIndex = index - mediaFiles.length;
            removeVideoFile(videoIndex);
        }
    };

    // ========================================================================
    // SEND MESSAGE
    // ========================================================================
    /**
     * Sends a message to the AI and handles the complete message lifecycle.
     *
     * @param prompt - User's text prompt
     * @param files - Array of File objects attached to the message
     *
     * Flow:
     * 1. Validates that either prompt or files exist
     * 2. Creates user message object with timestamp
     * 3. Adds user message to messages array
     * 4. Resets input state (prompt text, uploaded files, upload box)
     * 5. Sets generating state for loading UI
     * 6. Calls Spring Boot backend API to generate portfolio refinement
     * 7. Updates preview HTML with AI-generated content
     * 8. Creates AI message and displays it in both chat drawer and overlay
     * 9. Resets generating state
     */
    const sendMessage = async (prompt: string, files: File[]) => {
        // Validate input
        if (!prompt.trim() && files.length === 0) return;

        // Create user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: prompt,
            timestamp: new Date(),
        };

        // Add user message to chat history
        setMessages((prev) => [...prev, userMessage]);

        // Clear uploaded files from Zustand store
        // Note: We need to clear both mediaFiles and videoFiles
        while (mediaFiles.length > 0) {
            removeMediaFile(0);
        }
        while (videoFiles.length > 0) {
            removeVideoFile(0);
        }

        // Set loading state
        setIsGenerating(true);

        try {
            // ============================================================
            // BACKEND CALL: Spring Boot API
            // ============================================================
            // TODO: Replace this mock implementation with actual API call
            //
            // Endpoint: POST /api/portfolio/refine
            //
            // Request Body (FormData):
            // - prompt: string (user's refinement request)
            // - files: File[] (optional media/video files)
            // - resumeFile: File (from Zustand store - usePortfolioStore().resumeFile)
            // - templateId: string (from Zustand store - usePortfolioStore().templateId)
            // - currentHtml: string (from Zustand store - usePortfolioStore().previewHtml)
            //
            // Expected Response:
            // {
            //   success: boolean,
            //   message: string (AI's response message),
            //   updatedHtml: string (refined HTML for preview),
            //   timestamp: string
            // }
            //
            // Example implementation:
            // const formData = new FormData();
            // formData.append('prompt', prompt);
            // formData.append('templateId', usePortfolioStore.getState().templateId || '');
            // formData.append('currentHtml', usePortfolioStore.getState().previewHtml || '');
            // files.forEach((file, index) => {
            //   formData.append(`files[${index}]`, file);
            // });
            // const resumeFile = usePortfolioStore.getState().resumeFile;
            // if (resumeFile) {
            //   formData.append('resumeFile', resumeFile.file);
            // }
            //
            // const response = await fetch('http://localhost:8080/api/portfolio/refine', {
            //   method: 'POST',
            //   body: formData,
            //   headers: {
            //     'Authorization': `Bearer ${token}` // Add auth token
            //   }
            // });
            //
            // const data = await response.json();
            // ============================================================

            // MOCK RESPONSE - Remove this when implementing real backend
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const aiResponseText =
                "I've refined your portfolio based on your request. The preview has been updated!";
            const mockUpdatedHtml = "<div>Updated portfolio HTML</div>";

            // Update preview HTML in Zustand store
            setPreviewHtml(mockUpdatedHtml);

            // Create AI message
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: aiResponseText,
                timestamp: new Date(),
            };

            // Add AI message to chat history
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error sending message to AI:", error);

            // Show error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content:
                    "Sorry, there was an error processing your request. Please try again.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            // Reset loading state
            setIsGenerating(false);
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="h-screen flex flex-col overflow-hidden relative">
            {/* ================================================ */}
            {/* LAYER 1: SANDBOX - FULL SCREEN (BASE, z-0) */}
            {/* ================================================ */}
            <Preview previewHtml={previewHtml} />

            {/* ================================================ */}
            {/* LAYER 2: CHAT HISTORY OVERLAY - CENTER (z-40) */}
            {/* ================================================ */}
            {messages.length > 0 && (
                <ChatHistoryOverlay
                    messages={messages}
                    isGenerating={isGenerating}
                />
            )}

            {/* ================================================ */}
            {/* LAYER 3: FLOATING PROMPT BAR - BOTTOM (z-50) */}
            {/* ================================================ */}
            <FloatingPromptBar
                uploadedFiles={uploadedFiles}
                onSendMessage={sendMessage}
                onFileSelect={handleFileSelect}
                onRemoveFile={removeFile}
                isGenerating={isGenerating}
            />

            {/* ================================================ */}
            {/* LAYER 2 (OLD): CHATBOT OVERLAY - LEFT SIDE (z-50) */}
            {/* ================================================ */}
            {/*<ChatbotOverlay
                messages={messages}
                isGenerating={isGenerating}
                uploadedFiles={uploadedFiles}
                onSendMessage={sendMessage}
                onFileSelect={handleFileSelect}
                onRemoveFile={removeFile}
            />*/}
        </div>
    );
};

export default AIRefinementPage;
