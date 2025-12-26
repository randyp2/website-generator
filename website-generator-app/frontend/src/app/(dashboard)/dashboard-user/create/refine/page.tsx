"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiMonitor,
    FiTablet,
    FiSmartphone,
    FiPlus,
    FiUpload,
    FiX,
    FiSend,
    FiVideo,
    FiMessageSquare,
    FiZap,
} from "react-icons/fi";
import type { UploadedFile } from "@/types/file";
import { DeviceMode, FilePreview, Message } from "@/types/preview";
import { Preview } from "./components/Preview";
import { AiResponse } from "./components/AiResponse";
import { usePortfolioStore } from "@/stores/usePortfolioStore";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const AIRefinementPage: React.FC = () => {
    // Device preview mode
    const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");

    // Zustand store - All portfolio creation state
    const {
        aiPrompt,
        setAiPrompt,
        previewHtml,
        setPreviewHtml,
        mediaFiles,
        videoFiles,
        addMediaFiles,
        addVideoFiles,
        removeMediaFile,
        removeVideoFile,
    } = usePortfolioStore();

    const [uploadBoxOpen, setUploadBoxOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Messages & AI response
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentAIResponse, setCurrentAIResponse] = useState<string | null>(
        null
    );

    // Chat history drawer
    const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Combine media and video files for display
    const uploadedFiles = [...mediaFiles, ...videoFiles];

    /**
     * Auto-resize textarea effect.
     * Dynamically adjusts textarea height based on content.
     * Resets to auto first to allow shrinking, then sets to scrollHeight.
     * Triggers whenever promptText changes.
     */
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [aiPrompt]);

    /**
     * Auto-fade AI response overlay after 5 seconds.
     * Only fades when chat drawer is closed (prevents interference with drawer).
     * Cleans up timer if component unmounts or dependencies change.
     *
     * Dependencies:
     * - currentAIResponse: The AI message to display
     * - chatDrawerOpen: Prevents auto-fade when user is viewing chat history
     */
    useEffect(() => {
        if (currentAIResponse && !chatDrawerOpen) {
            const timer = setTimeout(() => {
                setCurrentAIResponse(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentAIResponse, chatDrawerOpen]);

    // ========================================================================
    // DEVICE MODE WIDTH
    // ========================================================================
    /**
     * Returns the width for the preview canvas based on the selected device mode.
     * @returns CSS width value as string (px or %)
     */
    const getPreviewWidth = () => {
        switch (deviceMode) {
            case "mobile":
                return "420px";
            case "tablet":
                return "768px";
            case "desktop":
            default:
                return "100%";
        }
    };

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
            }

            if (isImage) addMediaFiles([newUploadedFile]);
            else if(isVideo) addVideoFiles([newUploadedFile]);
        });
    };

    /**
     * Handles drag over event for drag & drop file upload.
     * Prevents default browser behavior and sets dragging state to true for visual feedback.
     */
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    /**
     * Handles drag leave event when user drags files away from drop zone.
     * Resets dragging state to remove visual feedback.
     */
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    /**
     * Handles drop event when files are dropped into the drop zone.
     * Extracts files from dataTransfer and passes them to handleFileSelect for processing.
     */
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
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

        // Reset input state
        setAiPrompt("");
        setUploadBoxOpen(false);

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

            const aiResponseText = "I've refined your portfolio based on your request. The preview has been updated!";
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

            // Show AI response overlay
            setCurrentAIResponse(aiResponseText);

        } catch (error) {
            console.error("Error sending message to AI:", error);

            // Show error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: "Sorry, there was an error processing your request. Please try again.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
            setCurrentAIResponse("Error processing request. Please try again.");
        } finally {
            // Reset loading state
            setIsGenerating(false);
        }
    };

    /**
     * Handler for send button click.
     * Extracts File objects from uploadedFiles and triggers sendMessage.
     */
    const handleSend = () => {
        const files = uploadedFiles.map((f) => f.file);
        sendMessage(aiPrompt, files);
    };

    /**
     * Handles keyboard events in the textarea.
     * Sends message on Enter key press (without Shift).
     * Allows Shift+Enter for multi-line input.
     *
     * @param e - Keyboard event from textarea
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="h-screen flex flex-col overflow-hidden relative">
            {/* ================================================ */}
            {/* LAYER 1: FULL SCREEN PREVIEW (BASE) */}
            {/* ================================================ */}
            <Preview
                setDeviceMode={setDeviceMode}
                deviceMode={deviceMode}
                getPreviewWidth={getPreviewWidth}
                previewHtml={previewHtml}
            />

            {/* ================================================ */}
            {/* LAYER 2: AI RESPONSE (SMALL OVERLAY) */}
            {/* ================================================ */}
            <AiResponse 
                currentAIResponse={currentAIResponse}
                setCurrentAIResponse={setCurrentAIResponse}
                chatDrawerOpen={chatDrawerOpen}
                setChatDrawerOpen={setChatDrawerOpen}
            />

            {/* ================================================ */}
            {/* LAYER 3: CHAT HISTORY DRAWER (FULL HEIGHT) */}
            {/* ================================================ */}
            <AnimatePresence>
                {chatDrawerOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute top-0 right-0 bottom-0 w-[400px] bg-white border-l border-slate-200 flex flex-col z-50 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FiMessageSquare className="w-4 h-4 text-sky-600" />
                                <span className="text-sm font-semibold text-slate-700">
                                    Chat History
                                </span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setChatDrawerOpen(false)}
                                className="w-6 h-6 rounded-full hover:bg-slate-200 flex items-center justify-center"
                            >
                                <FiX className="w-4 h-4 text-slate-600" />
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-4">
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center mt-8">
                                        No messages yet. Start a conversation!
                                    </p>
                                ) : (
                                    messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`${msg.role === "user" ? "text-right" : "text-left"
                                                }`}
                                        >
                                            <div
                                                className={`inline-block max-w-[85%] px-3 py-2 rounded-lg text-sm ${msg.role === "user"
                                                        ? "bg-linear-to-r from-sky-500 to-cyan-500 text-white"
                                                        : "bg-slate-100 text-slate-900"
                                                    }`}
                                            >
                                                {msg.role === "ai" && (
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <FiZap className="w-3 h-3 text-sky-600" />
                                                        <span className="text-xs font-semibold text-slate-600">
                                                            AI
                                                        </span>
                                                    </div>
                                                )}
                                                <p>{msg.content}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                {isGenerating && (
                                    <div className="text-left">
                                        <div className="inline-block bg-slate-100 px-3 py-2 rounded-lg">
                                            <p className="text-sm text-slate-600">Thinking...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ================================================ */}
            {/* LAYER 4: BOTTOM PROMPT DOCK (OVERLAY) */}
            {/* ================================================ */}
            <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none">
                <div className="w-full max-w-[1600px] px-6 pointer-events-auto">
                    {/* Upload Box */}
                    <AnimatePresence>
                        {uploadBoxOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden mb-2"
                            >
                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-lg p-4">
                                    {/* Drag & Drop Zone */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${isDragging
                                                ? "border-sky-400 bg-sky-50 shadow-lg"
                                                : "border-slate-300 bg-slate-50 hover:border-sky-300"
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <motion.div
                                                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <FiUpload className="w-8 h-8 text-slate-400" />
                                            </motion.div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-slate-700">
                                                    Drop images or videos here
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    or click to browse (jpg, png, webp, mp4, mov)
                                                </p>
                                            </div>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                                            multiple
                                            onChange={(e) => handleFileSelect(e.target.files)}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* File Preview Chips */}
                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <AnimatePresence>
                                                {uploadedFiles.map((file, index) => {
                                                    const isImage = file.type.startsWith("image/");
                                                    const preview = URL.createObjectURL(file.file);

                                                    return (
                                                        <motion.div
                                                            key={`${file.name}-${index}`}
                                                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.8, x: -20 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2 pr-3 shadow-sm"
                                                        >
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                                                                {isImage ? (
                                                                    <img
                                                                        src={preview}
                                                                        alt={file.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <FiVideo className="w-6 h-6 text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-slate-700 truncate">
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => removeFile(index)}
                                                                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-colors"
                                                            >
                                                                <FiX className="w-4 h-4 text-slate-600" />
                                                            </motion.button>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Prompt Bar */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-xl">
                        <div className="p-4">
                            <div className="flex items-end gap-3">
                                {/* Plus Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setUploadBoxOpen(!uploadBoxOpen)}
                                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${uploadBoxOpen
                                            ? "bg-sky-500 text-white shadow-lg"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    <motion.div
                                        animate={uploadBoxOpen ? { rotate: 45 } : { rotate: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <FiPlus className="w-5 h-5" />
                                    </motion.div>
                                </motion.button>

                                {/* Textarea */}
                                <div className="flex-1">
                                    <textarea
                                        ref={textareaRef}
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask PortfolioAI to refine something…"
                                        disabled={isGenerating}
                                        rows={1}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all resize-none text-sm text-slate-900 placeholder:text-slate-400 max-h-[200px] overflow-y-auto"
                                    />
                                </div>

                                {/* Send Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={
                                        isGenerating ||
                                        (!aiPrompt.trim() && uploadedFiles.length === 0)
                                    }
                                    className="shrink-0 w-10 h-10 rounded-xl bg-linear-to-r from-sky-500 to-cyan-500 text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiSend className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-sky-600 mt-2 ml-14"
                                >
                                    {uploadedFiles.length} file(s) attached
                                </motion.p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIRefinementPage;
