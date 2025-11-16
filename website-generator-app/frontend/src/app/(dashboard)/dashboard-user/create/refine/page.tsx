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

// ============================================================================
// TYPES
// ============================================================================
interface UploadedFile {
    id: string;
    file: File;
    preview: string;
    type: "image" | "video";
}

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const AIRefinementPage: React.FC = () => {
    // Device preview mode
    const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");

    // Prompt state
    const [promptText, setPromptText] = useState("");
    const [uploadBoxOpen, setUploadBoxOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Messages & AI response
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentAIResponse, setCurrentAIResponse] = useState<string | null>(null);

    // Chat history drawer
    const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [promptText]);

    // Auto-fade AI response after 5 seconds (unless drawer is open)
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
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newFiles: UploadedFile[] = [];
        Array.from(files).forEach((file) => {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");

            if (isImage || isVideo) {
                const preview = URL.createObjectURL(file);
                newFiles.push({
                    id: Math.random().toString(36).substring(7),
                    file,
                    preview,
                    type: isImage ? "image" : "video",
                });
            }
        });

        setUploadedFiles((prev) => [...prev, ...newFiles]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const removeFile = (id: string) => {
        setUploadedFiles((prev) => {
            const fileToRemove = prev.find((f) => f.id === id);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter((f) => f.id !== id);
        });
    };

    // ========================================================================
    // SEND MESSAGE
    // ========================================================================
    const sendMessage = async (prompt: string, files: File[]) => {
        if (!prompt.trim() && files.length === 0) return;

        const userMessage: Message = {
            id: Math.random().toString(36).substring(7),
            role: "user",
            content: prompt + (files.length > 0 ? ` [${files.length} file(s) attached]` : ""),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setPromptText("");
        uploadedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
        setUploadedFiles([]);
        setUploadBoxOpen(false);
        setIsGenerating(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: Math.random().toString(36).substring(7),
                role: "ai",
                content: `I've updated your portfolio based on: "${prompt}". The preview has been refreshed!`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
            setCurrentAIResponse(aiMessage.content);
            setIsGenerating(false);
        }, 1500);
    };

    const handleSend = () => {
        const files = uploadedFiles.map((f) => f.file);
        sendMessage(promptText, files);
    };

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
        <div className="h-screen flex flex-col overflow-hidden relative ">
            {/* ================================================ */}
            {/* LAYER 1: FULL SCREEN PREVIEW (BASE) */}
            {/* ================================================ */}
            <div className="absolute inset-0 bg-slate-100">
                <div className="h-full flex justify-center items-center">
                    {/* Device Mode Buttons - Floating Top Right */}
                    <div className="absolute top-6 right-6 flex gap-2 z-30">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeviceMode("desktop")}
                            className={`p-2 rounded-lg transition-all backdrop-blur-xl border ${
                                deviceMode === "desktop"
                                    ? "bg-sky-500 text-white shadow-md border-sky-600"
                                    : "bg-white/90 text-slate-600 hover:bg-white border-slate-200"
                            }`}
                            title="Desktop View"
                        >
                            <FiMonitor className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeviceMode("tablet")}
                            className={`p-2 rounded-lg transition-all backdrop-blur-xl border ${
                                deviceMode === "tablet"
                                    ? "bg-sky-500 text-white shadow-md border-sky-600"
                                    : "bg-white/90 text-slate-600 hover:bg-white border-slate-200"
                            }`}
                            title="Tablet View"
                        >
                            <FiTablet className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeviceMode("mobile")}
                            className={`p-2 rounded-lg transition-all backdrop-blur-xl border ${
                                deviceMode === "mobile"
                                    ? "bg-sky-500 text-white shadow-md border-sky-600"
                                    : "bg-white/90 text-slate-600 hover:bg-white border-slate-200"
                            }`}
                            title="Mobile View"
                        >
                            <FiSmartphone className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Preview Canvas */}
                    <motion.div
                        animate={{ width: getPreviewWidth() }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="bg-white rounded-lg shadow-2xl border border-slate-300  overflow-hidden h-full"
                    >
                        {/* Placeholder Portfolio Preview */}
                        <div className="h-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center text-center space-y-6 p-12 overflow-auto">
                            <motion.div
                                animate={{ scale: [0.95, 1, 0.95] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-24 h-24 bg-linear-to-br from-sky-400 to-cyan-400 rounded-full"
                            />
                            <h1 className="text-4xl font-bold text-white">Your Name</h1>
                            <p className="text-slate-300 text-lg">Software Engineer</p>
                            <div className="flex flex-wrap gap-3 justify-center mt-8">
                                {["React", "TypeScript", "Node.js", "Python"].map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <p className="text-slate-400 text-sm mt-12">
                                Preview updates in real-time
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ================================================ */}
            {/* LAYER 2: AI RESPONSE (SMALL OVERLAY) */}
            {/* ================================================ */}
            <AnimatePresence>
                {currentAIResponse && !chatDrawerOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-6 left-6 z-40 max-w-md"
                    >
                        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-4 border border-slate-200 shadow-xl">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <FiZap className="w-4 h-4 text-sky-600" />
                                    <span className="text-xs font-semibold text-slate-600">
                                        PortfolioAI
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setChatDrawerOpen(true)}
                                        className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                                    >
                                        View History
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setCurrentAIResponse(null)}
                                        className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center"
                                    >
                                        <FiX className="w-3 h-3 text-slate-600" />
                                    </motion.button>
                                </div>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {currentAIResponse}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                            className={`${
                                                msg.role === "user" ? "text-right" : "text-left"
                                            }`}
                                        >
                                            <div
                                                className={`inline-block max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                                                    msg.role === "user"
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
                                        className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                                            isDragging
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
                                                {uploadedFiles.map((file) => (
                                                    <motion.div
                                                        key={file.id}
                                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.8, x: -20 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2 pr-3 shadow-sm"
                                                    >
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                                                            {file.type === "image" ? (
                                                                <img
                                                                    src={file.preview}
                                                                    alt={file.file.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <FiVideo className="w-6 h-6 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                                {file.file.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => removeFile(file.id)}
                                                            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-colors"
                                                        >
                                                            <FiX className="w-4 h-4 text-slate-600" />
                                                        </motion.button>
                                                    </motion.div>
                                                ))}
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
                                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                        uploadBoxOpen
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
                                        value={promptText}
                                        onChange={(e) => setPromptText(e.target.value)}
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
                                    disabled={isGenerating || (!promptText.trim() && uploadedFiles.length === 0)}
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
