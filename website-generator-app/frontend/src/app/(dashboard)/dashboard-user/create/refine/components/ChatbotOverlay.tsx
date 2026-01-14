"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiZap,
    FiPlus,
    FiSend,
    FiUpload,
    FiX,
    FiVideo,
    FiUser,
} from "react-icons/fi";
import type { UploadedFile } from "@/types/file";
import { Message } from "@/types/preview";
import { useSidebar } from "@/context/SidebarContext";

interface ChatbotOverlayProps {
    messages: Message[];
    isGenerating: boolean;
    uploadedFiles: UploadedFile[];
    onSendMessage: (prompt: string, files: File[]) => void;
    onFileSelect: (files: FileList | null) => void;
    onRemoveFile: (index: number) => void;
}

export const ChatbotOverlay: React.FC<ChatbotOverlayProps> = ({
    messages,
    isGenerating,
    uploadedFiles,
    onSendMessage,
    onFileSelect,
    onRemoveFile,
}) => {
    // Get sidebar state from context
    const { collapsed: sidebarCollapsed } = useSidebar();
    // Local state
    const [prompt, setPrompt] = useState("");
    const [uploadBoxOpen, setUploadBoxOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);

    // Send handler
    const handleSend = () => {
        if (!prompt.trim() && uploadedFiles.length === 0) return;

        const files = uploadedFiles.map((f) => f.file);
        onSendMessage(prompt, files);
        setPrompt("");
        setUploadBoxOpen(false);
    };

    // Keyboard handler
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Format timestamp
    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);

        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <motion.div
            animate={{ left: sidebarCollapsed ? 80 : 280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 md:left-[280px] top-0 h-screen w-full md:w-[40vw] z-50 bg-[#1a1d21] border-r border-white/10 flex flex-col"
        >
            {/* ================================================ */}
            {/* HEADER */}
            {/* ================================================ */}
            <div className="h-15 border-b border-white/10 bg-[#1a1d21] px-6 py-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-600/20">
                    <FiZap className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white">
                        PortfolioAI Chat
                    </h2>
                    <p className="text-xs text-white/40">
                        {messages.length === 0
                            ? "Start a conversation"
                            : `${messages.length} message${messages.length !== 1 ? "s" : ""}`}
                    </p>
                </div>
            </div>

            {/* ================================================ */}
            {/* MESSAGES CONTAINER */}
            {/* ================================================ */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/20">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <FiZap className="w-8 h-8 text-white/20" />
                        </div>
                        <h3 className="text-lg font-semibold text-white/70 mb-2">
                            No messages yet
                        </h3>
                        <p className="text-sm text-white/40 max-w-sm">
                            Ask PortfolioAI to refine your portfolio. You can
                            upload images or videos to include in your design.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`flex ${
                                    message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`flex gap-2 max-w-[80%] ${
                                        message.role === "user"
                                            ? "flex-row-reverse"
                                            : "flex-row"
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                            message.role === "user"
                                                ? "bg-sky-600"
                                                : "bg-white/10 border border-white/20"
                                        }`}
                                    >
                                        {message.role === "user" ? (
                                            <FiUser className="w-4 h-4 text-white" />
                                        ) : (
                                            <FiZap className="w-4 h-4 text-sky-400" />
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div>
                                        <div
                                            className={`px-4 py-3 ${
                                                message.role === "user"
                                                    ? "bg-sky-600 text-white rounded-2xl rounded-tr-md"
                                                    : "bg-white/5 border border-white/10 text-white/90 rounded-2xl rounded-tl-md"
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        </div>
                                        <p
                                            className={`text-xs text-white/40 mt-1 ${
                                                message.role === "user"
                                                    ? "text-right"
                                                    : "text-left"
                                            }`}
                                        >
                                            {formatTimestamp(message.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing Indicator */}
                        {isGenerating && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-2">
                                    {/* Avatar */}
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                        <FiZap className="w-4 h-4 text-sky-400" />
                                    </div>

                                    {/* Typing Bubble */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-md px-4 py-3">
                                        <div className="flex gap-1">
                                            <motion.div
                                                animate={{
                                                    opacity: [0.4, 1, 0.4],
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1.5,
                                                }}
                                                className="w-2 h-2 bg-white/40 rounded-full"
                                            />
                                            <motion.div
                                                animate={{
                                                    opacity: [0.4, 1, 0.4],
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1.5,
                                                    delay: 0.2,
                                                }}
                                                className="w-2 h-2 bg-white/40 rounded-full"
                                            />
                                            <motion.div
                                                animate={{
                                                    opacity: [0.4, 1, 0.4],
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1.5,
                                                    delay: 0.4,
                                                }}
                                                className="w-2 h-2 bg-white/40 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* ================================================ */}
            {/* INPUT AREA */}
            {/* ================================================ */}
            <div className="border-t border-white/10 bg-[#1a1d21] p-4">
                {/* Upload Box */}
                <AnimatePresence>
                    {uploadBoxOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden mb-3"
                        >
                            <div className="bg-[#25292e] rounded-xl border border-white/10 p-4">
                                {/* Drag & Drop Zone */}
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        onFileSelect(e.dataTransfer.files);
                                    }}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
                                        isDragging
                                            ? "border-sky-500 bg-sky-500/10"
                                            : "border-white/20 hover:border-white/30 hover:bg-white/5"
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <motion.div
                                            animate={
                                                isDragging
                                                    ? { scale: 1.1 }
                                                    : { scale: 1 }
                                            }
                                            transition={{ duration: 0.2 }}
                                        >
                                            <FiUpload className="w-8 h-8 text-white/40" />
                                        </motion.div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-white/70">
                                                Drop images or videos here
                                            </p>
                                            <p className="text-xs text-white/40 mt-1">
                                                or click to browse (jpg, png,
                                                webp, mp4, mov)
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                                        multiple
                                        onChange={(e) =>
                                            onFileSelect(e.target.files)
                                        }
                                        className="hidden"
                                    />
                                </div>

                                {/* File Preview Chips */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <AnimatePresence>
                                            {uploadedFiles.map((file, index) => {
                                                const isImage =
                                                    file.type.startsWith(
                                                        "image/",
                                                    );
                                                const preview =
                                                    URL.createObjectURL(
                                                        file.file,
                                                    );

                                                return (
                                                    <motion.div
                                                        key={`${file.name}-${index}`}
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0.8,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            scale: 0.8,
                                                            x: -20,
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2"
                                                    >
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1a1d21] flex items-center justify-center shrink-0">
                                                            {isImage ? (
                                                                <img
                                                                    src={
                                                                        preview
                                                                    }
                                                                    alt={
                                                                        file.name
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <FiVideo className="w-6 h-6 text-white/40" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-white/70 truncate">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-white/40">
                                                                {(
                                                                    file.size /
                                                                    1024 /
                                                                    1024
                                                                ).toFixed(2)}{" "}
                                                                MB
                                                            </p>
                                                        </div>
                                                        <motion.button
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.9,
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onRemoveFile(
                                                                    index,
                                                                );
                                                            }}
                                                            className="w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                                                        >
                                                            <FiX className="w-4 h-4 text-white/60 hover:text-red-400" />
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

                {/* Input Row */}
                <div className="flex items-end gap-3">
                    {/* Plus Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setUploadBoxOpen(!uploadBoxOpen)}
                        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            uploadBoxOpen
                                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                                : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                    >
                        <motion.div
                            animate={
                                uploadBoxOpen ? { rotate: 45 } : { rotate: 0 }
                            }
                            transition={{ duration: 0.2 }}
                        >
                            <FiPlus className="w-5 h-5" />
                        </motion.div>
                    </motion.button>

                    {/* Textarea */}
                    <div className="flex-1">
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything..."
                            disabled={isGenerating}
                            rows={1}
                            className="w-full px-4 py-3 bg-[#25292e] border border-white/10 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all resize-none text-sm text-white placeholder:text-white/40 max-h-[120px] overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Send Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        disabled={
                            isGenerating ||
                            (!prompt.trim() && uploadedFiles.length === 0)
                        }
                        className="shrink-0 w-10 h-10 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <FiSend className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* File Count */}
                {uploadedFiles.length > 0 && !uploadBoxOpen && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-sky-400 mt-2 ml-14"
                    >
                        {uploadedFiles.length} file(s) attached
                    </motion.p>
                )}
            </div>
        </motion.div>
    );
};
