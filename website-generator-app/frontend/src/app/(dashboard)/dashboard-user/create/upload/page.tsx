"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
    FiUpload,
    FiFile,
    FiImage,
    FiVideo,
    FiArrowRight,
    FiX,
    FiCheck,
    FiEdit2,
} from "react-icons/fi";

interface UploadedFile {
    name: string;
    size: number;
    type: string;
    title?: string;
    description?: string;
}

const UploadPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");

    const [resumeFile, setResumeFile] = useState<UploadedFile | null>(null);
    const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);
    const [videoFiles, setVideoFiles] = useState<UploadedFile[]>([]);
    const [pendingMediaFiles, setPendingMediaFiles] = useState<UploadedFile[]>([]);
    const [pendingVideoFiles, setPendingVideoFiles] = useState<UploadedFile[]>([]);
    const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);
    const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);

    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "resume" | "media" | "video"
    ) => {
        const files = e.target.files;
        if (!files) return;

        const fileArray = Array.from(files).map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            title: "",
            description: "",
        }));

        if (type === "resume") {
            setResumeFile(fileArray[0]);
        } else if (type === "media") {
            setPendingMediaFiles(fileArray);
        } else if (type === "video") {
            setPendingVideoFiles(fileArray);
        }

        e.target.value = "";
    };

    const removeFile = (
        type: "resume" | "media" | "video",
        index?: number
    ) => {
        if (type === "resume") {
            setResumeFile(null);
        } else if (type === "media" && index !== undefined) {
            setMediaFiles((prev) => prev.filter((_, i) => i !== index));
        } else if (type === "video" && index !== undefined) {
            setVideoFiles((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const updateFileTitle = (
        type: "media" | "video",
        index: number,
        title: string
    ) => {
        if (type === "media") {
            setMediaFiles((prev) =>
                prev.map((file, i) => (i === index ? { ...file, title } : file))
            );
        } else if (type === "video") {
            setVideoFiles((prev) =>
                prev.map((file, i) => (i === index ? { ...file, title } : file))
            );
        }
    };

    const updatePendingFileTitle = (
        type: "media" | "video",
        index: number,
        title: string
    ) => {
        if (type === "media") {
            setPendingMediaFiles((prev) =>
                prev.map((file, i) => (i === index ? { ...file, title } : file))
            );
        } else if (type === "video") {
            setPendingVideoFiles((prev) =>
                prev.map((file, i) => (i === index ? { ...file, title } : file))
            );
        }
    };

    const updatePendingFileDescription = (
        type: "media" | "video",
        index: number,
        description: string
    ) => {
        if (type === "media") {
            setPendingMediaFiles((prev) =>
                prev.map((file, i) => (i === index ? { ...file, description } : file))
            );
        } else if (type === "video") {
            setPendingVideoFiles((prev) =>
                prev.map((file, i) => (i === index ? { ...file, description } : file))
            );
        }
    };

    const updateFileDescription = (
        type: "media" | "video",
        index: number,
        description: string
    ) => {
        if (type === "media") {
            setMediaFiles((prev) =>
                prev.map((file, i) => (i === index ? { ...file, description } : file))
            );
        } else if (type === "video") {
            setVideoFiles((prev) =>
                prev.map((file, i) => (i === index ? { ...file, description } : file))
            );
        }
    };

    const confirmPendingFiles = (type: "media" | "video") => {
        if (type === "media") {
            setMediaFiles((prev) => [...prev, ...pendingMediaFiles]);
            setPendingMediaFiles([]);
        } else if (type === "video") {
            setVideoFiles((prev) => [...prev, ...pendingVideoFiles]);
            setPendingVideoFiles([]);
        }
    };

    const cancelPendingFiles = (type: "media" | "video") => {
        if (type === "media") {
            setPendingMediaFiles([]);
        } else if (type === "video") {
            setPendingVideoFiles([]);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const handleContinue = () => {
        router.push(
            `/dashboard-user/create/refine?templateId=${templateId}`
        );
    };

    const handleSkip = () => {
        router.push(
            `/dashboard-user/create/refine?templateId=${templateId}`
        );
    };

    return (
        <div className="min-h-screen p-10 pb-32">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full text-sky-700 font-semibold text-sm mb-4">
                    Step 2 of 3
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                    Upload Your Content
                </h1>
                <p className="text-lg text-slate-600">
                    Upload your resume and media files to help{" "}
                    <span className="text-2xl font-semibold text-sky-400">AI</span>{" "}
                    personalize your portfolio. You can always add more later.
                </p>
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-320px)] min-h-[600px]">
                {/* Left Column - Resume Upload (Full Height) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex flex-col h-full"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <FiFile className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Resume / CV
                            </h2>
                            <p className="text-sm text-slate-500">
                                PDF or DOCX format
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        {!resumeFile ? (
                            <label className="block w-full h-full">
                                <input
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={(e) => handleFileUpload(e, "resume")}
                                    className="hidden"
                                />
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-12 h-full flex flex-col items-center justify-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all"
                                >
                                    <FiUpload className="w-16 h-16 text-slate-400 mb-4" />
                                    <p className="text-slate-700 font-semibold mb-2 text-lg">
                                        Click to upload your resume
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Supports PDF and DOCX files
                                    </p>
                                </motion.div>
                            </label>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full flex items-center justify-between p-4 bg-sky-50 rounded-xl border border-sky-200"
                            >
                                <div className="flex items-center gap-3">
                                    <FiCheck className="w-5 h-5 text-sky-600" />
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {resumeFile.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {formatFileSize(resumeFile.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile("resume")}
                                    className="p-2 hover:bg-sky-100 rounded-lg transition-colors"
                                >
                                    <FiX className="w-5 h-5 text-slate-600" />
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column - Media and Video Uploads Stacked */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Media Files Upload */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex-1 flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-cyan-100 rounded-lg">
                                <FiImage className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Media Files
                                </h2>
                                <p className="text-sm text-slate-500">
                                    JPG, PNG images for your portfolio
                                </p>
                            </div>
                        </div>

                        {/* Base Upload Card - Show when no files uploaded and no pending */}
                        {mediaFiles.length === 0 && pendingMediaFiles.length === 0 && (
                            <label className="flex-1 flex items-center justify-center">
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    multiple
                                    onChange={(e) => handleFileUpload(e, "media")}
                                    className="hidden"
                                />
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 w-full text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/50 transition-all"
                                >
                                    <FiUpload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-700 font-semibold mb-1">
                                        Click to upload images
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Supports JPG and PNG files (multiple allowed)
                                    </p>
                                </motion.div>
                            </label>
                        )}

                        {/* Title Entry Form - Show when files are pending */}
                        {pendingMediaFiles.length > 0 && (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="mb-3 pb-2 border-b border-cyan-200">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Add details for your images
                                    </p>
                                </div>
                                <div className="space-y-3 overflow-y-auto flex-1 pr-2 mb-4">
                                    {pendingMediaFiles.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-200 space-y-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <FiImage className="w-4 h-4 text-cyan-600 mt-1" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900 text-sm truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter title..."
                                                    value={file.title || ""}
                                                    onChange={(e) =>
                                                        updatePendingFileTitle("media", index, e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 text-sm bg-white border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                    Description
                                                </label>
                                                <textarea
                                                    placeholder="Enter description..."
                                                    value={file.description || ""}
                                                    onChange={(e) =>
                                                        updatePendingFileDescription("media", index, e.target.value)
                                                    }
                                                    rows={2}
                                                    className="w-full px-3 py-2 text-sm bg-white border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => cancelPendingFiles("media")}
                                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => confirmPendingFiles("media")}
                                        className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List View - Show when files are stored */}
                        {mediaFiles.length > 0 && pendingMediaFiles.length === 0 && (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-200">
                                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <FiCheck className="w-4 h-4 text-cyan-600" />
                                        {mediaFiles.length} {mediaFiles.length === 1 ? 'Image' : 'Images'} Stored
                                    </p>
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png"
                                            multiple
                                            onChange={(e) => handleFileUpload(e, "media")}
                                            className="hidden"
                                        />
                                        <div className="px-3 py-1.5 bg-cyan-500 text-white text-xs rounded-lg font-semibold hover:bg-cyan-600 transition-colors">
                                            + Add More
                                        </div>
                                    </label>
                                </div>
                                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                                    {mediaFiles.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-cyan-50 rounded-lg border border-cyan-200 overflow-hidden"
                                        >
                                            {editingMediaIndex === index ? (
                                                <div className="p-3 space-y-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-xs font-semibold text-slate-700">Edit Details</p>
                                                        <button
                                                            onClick={() => setEditingMediaIndex(null)}
                                                            className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold"
                                                        >
                                                            Done
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                                            Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter title..."
                                                            value={file.title || ""}
                                                            onChange={(e) =>
                                                                updateFileTitle("media", index, e.target.value)
                                                            }
                                                            className="w-full px-2 py-1.5 text-sm bg-white border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            placeholder="Enter description..."
                                                            value={file.description || ""}
                                                            onChange={(e) =>
                                                                updateFileDescription("media", index, e.target.value)
                                                            }
                                                            rows={2}
                                                            className="w-full px-2 py-1.5 text-sm bg-white border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {file.name} • {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="p-3 flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 text-sm">
                                                            {file.title || "Untitled"}
                                                        </p>
                                                        {file.description && (
                                                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                                                                {file.description}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-slate-500 mt-1 truncate">
                                                            {file.name} • {formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => setEditingMediaIndex(index)}
                                                            className="p-1.5 hover:bg-cyan-100 rounded-lg transition-colors group"
                                                            title="Edit details"
                                                        >
                                                            <FiEdit2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeFile("media", index)}
                                                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors group"
                                                            title="Delete image"
                                                        >
                                                            <FiX className="w-4 h-4 text-slate-600 group-hover:text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Video Files Upload */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex-1 flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FiVideo className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Video Clips
                                </h2>
                                <p className="text-sm text-slate-500">
                                    MP3, MP4, MOV format
                                </p>
                            </div>
                        </div>

                        {/* Base Upload Card - Show when no files uploaded and no pending */}
                        {videoFiles.length === 0 && pendingVideoFiles.length === 0 && (
                            <label className="flex-1 flex items-center justify-center">
                                <input
                                    type="file"
                                    accept=".mp3,.mp4,.mov"
                                    multiple
                                    onChange={(e) => handleFileUpload(e, "video")}
                                    className="hidden"
                                />
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 w-full text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
                                >
                                    <FiUpload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-700 font-semibold mb-1">
                                        Click to upload video clips
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Supports MP3, MP4, and MOV files (multiple allowed)
                                    </p>
                                </motion.div>
                            </label>
                        )}

                        {/* Title Entry Form - Show when files are pending */}
                        {pendingVideoFiles.length > 0 && (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="mb-3 pb-2 border-b border-purple-200">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Add details for your videos
                                    </p>
                                </div>
                                <div className="space-y-3 overflow-y-auto flex-1 pr-2 mb-4">
                                    {pendingVideoFiles.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <FiVideo className="w-4 h-4 text-purple-600 mt-1" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900 text-sm truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter title..."
                                                    value={file.title || ""}
                                                    onChange={(e) =>
                                                        updatePendingFileTitle("video", index, e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 text-sm bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                    Description
                                                </label>
                                                <textarea
                                                    placeholder="Enter description..."
                                                    value={file.description || ""}
                                                    onChange={(e) =>
                                                        updatePendingFileDescription("video", index, e.target.value)
                                                    }
                                                    rows={2}
                                                    className="w-full px-3 py-2 text-sm bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => cancelPendingFiles("video")}
                                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => confirmPendingFiles("video")}
                                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List View - Show when files are stored */}
                        {videoFiles.length > 0 && pendingVideoFiles.length === 0 && (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-200">
                                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <FiCheck className="w-4 h-4 text-purple-600" />
                                        {videoFiles.length} {videoFiles.length === 1 ? 'Video' : 'Videos'} Stored
                                    </p>
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept=".mp3,.mp4,.mov"
                                            multiple
                                            onChange={(e) => handleFileUpload(e, "video")}
                                            className="hidden"
                                        />
                                        <div className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                                            + Add More
                                        </div>
                                    </label>
                                </div>
                                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                                    {videoFiles.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-purple-50 rounded-lg border border-purple-200 overflow-hidden"
                                        >
                                            {editingVideoIndex === index ? (
                                                <div className="p-3 space-y-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-xs font-semibold text-slate-700">Edit Details</p>
                                                        <button
                                                            onClick={() => setEditingVideoIndex(null)}
                                                            className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                                                        >
                                                            Done
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                                            Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter title..."
                                                            value={file.title || ""}
                                                            onChange={(e) =>
                                                                updateFileTitle("video", index, e.target.value)
                                                            }
                                                            className="w-full px-2 py-1.5 text-sm bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            placeholder="Enter description..."
                                                            value={file.description || ""}
                                                            onChange={(e) =>
                                                                updateFileDescription("video", index, e.target.value)
                                                            }
                                                            rows={2}
                                                            className="w-full px-2 py-1.5 text-sm bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {file.name} • {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="p-3 flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 text-sm">
                                                            {file.title || "Untitled"}
                                                        </p>
                                                        {file.description && (
                                                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                                                                {file.description}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-slate-500 mt-1 truncate">
                                                            {file.name} • {formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => setEditingVideoIndex(index)}
                                                            className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors group"
                                                            title="Edit details"
                                                        >
                                                            <FiEdit2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeFile("video", index)}
                                                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors group"
                                                            title="Delete video"
                                                        >
                                                            <FiX className="w-4 h-4 text-slate-600 group-hover:text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Continue/Skip Buttons */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="flex items-center gap-4">
                        {/* Skip Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSkip}
                            className="hover:cursor-pointer px-6 py-3 bg-white text-slate-700 rounded-full font-semibold shadow-lg border-2 border-slate-200 hover:border-slate-300 transition-colors"
                        >
                            Skip for now
                        </motion.button>

                        {/* Continue Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleContinue}
                            className="hover:cursor-pointer px-8 py-4 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-full font-bold shadow-2xl shadow-sky-400/50 flex items-center gap-3"
                        >
                            Continue to AI Refinement
                            <FiArrowRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default UploadPage;