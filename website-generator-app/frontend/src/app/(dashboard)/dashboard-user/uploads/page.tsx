"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  FiUpload,
  FiFile,
  FiImage,
  FiX,
  FiEye,
  FiTrash2,
  FiDownload,
} from "react-icons/fi";

/**
 * MODULE 4: UPLOADS PAGE
 * 
 * Design Goals:
 * - Intuitive drag-and-drop interface
 * - Clear visual feedback during upload
 * - Easy file management (preview, delete)
 * - Separate zones for different file types
 * - Satisfying success animations
 */

interface UploadedFile {
  id: string;
  name: string;
  type: "resume" | "media";
  size: string;
  url: string;
  uploadedAt: Date;
}

interface UploadZoneProps {
  type: "resume" | "media";
  title: string;
  description: string;
  acceptedFormats: string;
  icon: React.ReactNode;
  files: UploadedFile[];
  uploading: string | null;
  uploadProgress: number;
  dragOver: string | null;
  onDrop: (e: React.DragEvent, type: "resume" | "media") => void;
  onDragOver: (e: React.DragEvent, type: "resume" | "media") => void;
  onDragLeave: () => void;
  onFileSelect: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "media"
  ) => void;
  onPreviewFile: (file: UploadedFile) => void;
  onDeleteFile: (id: string, type: "resume" | "media") => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  type,
  title,
  description,
  acceptedFormats,
  icon,
  files,
  uploading,
  uploadProgress,
  dragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
  onPreviewFile,
  onDeleteFile,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: type === "resume" ? 0 : 0.2 }}
    className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg"
  >
    {/* Header */}
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-linear-to-br from-sky-100 to-cyan-100 rounded-xl flex items-center justify-center text-sky-600">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{acceptedFormats}</p>
      </div>
    </div>

    {/* Drop Zone */}
    <div
      onDrop={(e) => onDrop(e, type)}
      onDragOver={(e) => onDragOver(e, type)}
      onDragLeave={onDragLeave}
      className={`relative border-2 border-dashed rounded-xl p-12 transition-all group cursor-pointer ${
        dragOver === type
          ? "border-sky-500 bg-sky-50"
          : "border-slate-300 hover:border-sky-400"
      }`}
    >
      <input
        type="file"
        accept={
          type === "resume"
            ? ".pdf,.docx,.doc"
            : "image/jpeg,image/png,image/svg+xml,image/gif"
        }
        onChange={(e) => onFileSelect(e, type)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        id={`file-input-${type}`}
      />

      {/* Upload Icon */}
      <div className="text-center">
        <motion.div
          animate={
            dragOver === type
              ? { scale: 1.1, y: -5 }
              : { scale: 1, y: 0 }
          }
          className="w-16 h-16 mx-auto bg-linear-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center mb-4 group-hover:from-sky-200 group-hover:to-cyan-200 transition-colors"
        >
          <FiUpload className="w-8 h-8 text-sky-600" />
        </motion.div>
        <p className="text-sm font-semibold text-slate-900 mb-1">
          Drop your {type === "resume" ? "resume" : "media"} here, or{" "}
          <label
            htmlFor={`file-input-${type}`}
            className="text-sky-600 hover:text-sky-700 cursor-pointer"
          >
            browse
          </label>
        </p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>

      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {uploading === type && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full mb-4"
            />
            <p className="text-sm font-semibold text-slate-900 mb-2">
              Uploading...
            </p>
            <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                className="h-full bg-linear-to-r from-sky-500 to-cyan-500"
              />
            </div>
            <p className="text-xs text-slate-600 mt-2">{uploadProgress}%</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Uploaded Files List */}
    <AnimatePresence>
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              Uploaded Files ({files.length})
            </p>
            {files.length > 0 && (
              <button className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
                <FiDownload className="w-3 h-3" />
                Download All
              </button>
            )}
          </div>

          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 group hover:border-sky-300 transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                  {type === "resume" ? (
                    <FiFile className="w-5 h-5 text-slate-600" />
                  ) : (
                    <FiImage className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">{file.size}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onPreviewFile(file)}
                  className="p-2 hover:bg-sky-100 rounded-lg transition-colors"
                  title="Preview"
                >
                  <FiEye className="w-4 h-4 text-sky-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDeleteFile(file.id, type)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete"
                >
                  <FiTrash2 className="w-4 h-4 text-red-600" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const UploadsPage: React.FC = () => {
  const [resumeFiles, setResumeFiles] = useState<UploadedFile[]>([]);
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const simulateUpload = (file: File, type: "resume" | "media") => {
    setUploading(type);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Create new file entry
          const newFile: UploadedFile = {
            id: Math.random().toString(),
            name: file.name,
            type,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            url: URL.createObjectURL(file),
            uploadedAt: new Date(),
          };

          // Add to appropriate list
          if (type === "resume") {
            setResumeFiles((prev) => [...prev, newFile]);
          } else {
            setMediaFiles((prev) => [...prev, newFile]);
          }

          setUploading(null);
          setUploadProgress(0);
          return 0;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "resume" | "media") => {
      e.preventDefault();
      setDragOver(null);
      
      const file = e.dataTransfer.files[0];
      if (file) {
        // Validate file type
        const validTypes = type === "resume" 
          ? [".pdf", ".docx", ".doc"]
          : [".jpg", ".jpeg", ".png", ".svg", ".gif"];
        
        const fileExtension = file.name.substring(file.name.lastIndexOf("."));
        if (validTypes.some(ext => fileExtension.toLowerCase().includes(ext.replace(".", "")))) {
          simulateUpload(file, type);
        } else {
          alert(`Invalid file type. Please upload ${validTypes.join(", ")}`);
        }
      }
    },
    []
  );

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "media"
  ) => {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file, type);
  };

  const handleDelete = (id: string, type: "resume" | "media") => {
    if (type === "resume") {
      setResumeFiles((prev) => prev.filter((f) => f.id !== id));
    } else {
      setMediaFiles((prev) => prev.filter((f) => f.id !== id));
    }
  };

  return (
    <div className="space-y-6 px-4 py-8 md:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Upload Your Files
        </h1>
        <p className="text-slate-600">
          Add your resume and media to personalize your portfolio
        </p>
      </motion.div>

      {/* Upload Zones Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <UploadZone
          type="resume"
          title="Resume Upload"
          description="PDF or DOCX, max 5MB"
          acceptedFormats="Accepts: PDF, DOCX"
          icon={<FiFile className="w-5 h-5" />}
          files={resumeFiles}
          uploading={uploading}
          uploadProgress={uploadProgress}
          dragOver={dragOver}
          onDrop={handleDrop}
          onDragOver={(e, type) => {
            e.preventDefault();
            setDragOver(type);
          }}
          onDragLeave={() => setDragOver(null)}
          onFileSelect={handleFileSelect}
          onPreviewFile={setPreviewFile}
          onDeleteFile={handleDelete}
        />

        <UploadZone
          type="media"
          title="Media Upload"
          description="Images, logos, headshots - max 10MB"
          acceptedFormats="Accepts: JPG, PNG, SVG, GIF"
          icon={<FiImage className="w-5 h-5" />}
          files={mediaFiles}
          uploading={uploading}
          uploadProgress={uploadProgress}
          dragOver={dragOver}
          onDrop={handleDrop}
          onDragOver={(e, type) => {
            e.preventDefault();
            setDragOver(type);
          }}
          onDragLeave={() => setDragOver(null)}
          onFileSelect={handleFileSelect}
          onPreviewFile={setPreviewFile}
          onDeleteFile={handleDelete}
        />
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {previewFile.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {previewFile.size} • Uploaded{" "}
                    {previewFile.uploadedAt.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Preview Content */}
              {previewFile.type === "media" ? (
                <Image
                  src={previewFile.url}
                  alt={previewFile.name}
                  width={1200}
                  height={800}
                  unoptimized
                  className="w-full rounded-xl h-auto"
                />
              ) : (
                <div className="aspect-[8.5/11] bg-slate-100 rounded-xl flex flex-col items-center justify-center">
                  <FiFile className="w-24 h-24 text-slate-400 mb-4" />
                  <p className="text-sm text-slate-600 mb-4">
                    PDF preview not available
                  </p>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors flex items-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download to View
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadsPage;
