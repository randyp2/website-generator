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
} from "react-icons/fi";

interface UploadedFile {
    name: string;
    size: number;
    type: string;
}

const UploadPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");

    const [resumeFile, setResumeFile] = useState<UploadedFile | null>(null);
    const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);
    const [videoFiles, setVideoFiles] = useState<UploadedFile[]>([]);

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
        }));

        if (type === "resume") {
            setResumeFile(fileArray[0]);
        } else if (type === "media") {
            setMediaFiles((prev) => [...prev, ...fileArray]);
        } else if (type === "video") {
            setVideoFiles((prev) => [...prev, ...fileArray]);
        }
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

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const handleContinue = () => {
        // Here you would typically upload the files to your backend
        // For now, we'll just navigate to the refinement page
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
        <div className="space-y-8  p-10 pb-32">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl mx-auto"
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

            {/* Upload Sections */}
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Resume Upload */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
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

                    {!resumeFile ? (
                        <label className="block">
                            <input
                                type="file"
                                accept=".pdf,.docx"
                                onChange={(e) => handleFileUpload(e, "resume")}
                                className="hidden"
                            />
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all"
                            >
                                <FiUpload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-700 font-semibold mb-1">
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
                            className="flex items-center justify-between p-4 bg-sky-50 rounded-xl border border-sky-200"
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
                </motion.div>

                {/* Media Files Upload */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
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

                    <label className="block mb-4">
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            multiple
                            onChange={(e) => handleFileUpload(e, "media")}
                            className="hidden"
                        />
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/50 transition-all"
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

                    {mediaFiles.length > 0 && (
                        <div className="space-y-2">
                            {mediaFiles.map((file, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiImage className="w-4 h-4 text-cyan-600" />
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile("media", index)}
                                        className="p-1 hover:bg-cyan-100 rounded transition-colors"
                                    >
                                        <FiX className="w-4 h-4 text-slate-600" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Video Files Upload */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
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

                    <label className="block mb-4">
                        <input
                            type="file"
                            accept=".mp3,.mp4,.mov"
                            multiple
                            onChange={(e) => handleFileUpload(e, "video")}
                            className="hidden"
                        />
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
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

                    {videoFiles.length > 0 && (
                        <div className="space-y-2">
                            {videoFiles.map((file, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiVideo className="w-4 h-4 text-purple-600" />
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile("video", index)}
                                        className="p-1 hover:bg-purple-100 rounded transition-colors"
                                    >
                                        <FiX className="w-4 h-4 text-slate-600" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
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