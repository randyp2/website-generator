"use client";

import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { UploadedFile } from "@/types/file";
import { formatFileSize } from "@/utils/fileHelpers";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { FiVideo, FiUpload, FiCheck, FiEdit2, FiX } from "react-icons/fi";

interface VideoUploadProps {
  pendingVideoFiles: UploadedFile[];
  updatePendingFileTitle: (
    type: "media" | "video",
    index: number,
    title: string
  ) => void;
  updatePendingFileDescription: (
    type: "media" | "video",
    index: number,
    description: string
  ) => void;
  cancelPendingFiles: (type: "media" | "video") => void;
  confirmPendingFiles: (type: "media" | "video") => void;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "media" | "video"
  ) => void;
}
export const VideoUpload: React.FC<VideoUploadProps> = ({
  pendingVideoFiles,
  updatePendingFileTitle,
  updatePendingFileDescription,
  cancelPendingFiles,
  confirmPendingFiles,
  handleFileUpload,
}) => {

   const videoFiles = usePortfolioStore(s => s.mediaFiles);
    const updateFileTitle = usePortfolioStore(s => s.updateVideoFileTitle);
    const updateFileDescription = usePortfolioStore(s => s.updateVideoFileDescription);
    const removeFile = usePortfolioStore(s => s.removeVideoFile);

  /**
   * STATE: Currently editing video file index
   *
   * Tracks which video file is currently being edited in the list view.
   * When a user clicks "edit" on a confirmed video file, this state stores
   * the array index of that file to show the edit form inline.
   *
   * - Type: number | null
   * - Initial value: null (no file being edited)
   * - Set to file index when edit button clicked
   * - Reset to null when user clicks "Done" or cancels editing
   */
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(
    null
  );
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.3 }}
      className="relative bg-white/5 rounded-2xl p-6 shadow-lg border border-white/10 flex-1 flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2 bg-white/10 rounded-lg border border-white/20">
          <FiVideo className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Video Clips</h2>
          <p className="text-sm text-white/60">MP3, MP4, MOV format</p>
        </div>
      </div>

      {/* Base Upload Card - Show when no files uploaded and no pending */}
      {videoFiles.length === 0 && pendingVideoFiles.length === 0 && (
        <label className="flex-1 flex items-center justify-center relative z-10">
          <input
            type="file"
            accept=".mp3,.mp4,.mov"
            multiple
            onChange={(e) => handleFileUpload(e, "video")}
            className="hidden"
          />
          <motion.div
            whileHover={{ scale: 1.01, borderColor: "rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="border-2 border-dashed border-white/20 rounded-xl p-8 w-full text-center cursor-pointer"
          >
            <FiUpload className="w-12 h-12 text-white/70 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              Click to upload video clips
            </p>
            <p className="text-sm text-white/60">
              Supports MP3, MP4, and MOV files (multiple allowed)
            </p>
          </motion.div>
        </label>
      )}

      {/* Title Entry Form - Show when files are pending */}
      {pendingVideoFiles.length > 0 && (
        <div className="flex flex-col flex-1 min-h-0 relative z-10">
          <div className="mb-3 pb-2 border-b border-white/20">
            <p className="text-sm font-semibold text-white/90">
              Add details for your videos
            </p>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2 mb-4">
            {pendingVideoFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <FiVideo className="w-4 h-4 text-white/70 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-white/60">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter title..."
                    value={file.title || ""}
                    onChange={(e) =>
                      updatePendingFileTitle("video", index, e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white placeholder:text-white/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter description..."
                    value={file.description || ""}
                    onChange={(e) =>
                      updatePendingFileDescription(
                        "video",
                        index,
                        e.target.value
                      )
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none text-white placeholder:text-white/50"
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={() => cancelPendingFiles("video")}
              className="flex-1 px-4 py-2 bg-white/5 text-white/90 rounded-lg font-semibold border border-white/20"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)", boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={() => confirmPendingFiles("video")}
              className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg font-semibold border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              Confirm
            </motion.button>
          </div>
        </div>
      )}

      {/* List View - Show when files are stored */}
      {videoFiles.length > 0 && pendingVideoFiles.length === 0 && (
        <div className="flex flex-col flex-1 min-h-0 relative z-10">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
            <p className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
              {videoFiles.length} {videoFiles.length === 1 ? "Video" : "Videos"}{" "}
              Stored
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".mp3,.mp4,.mov"
                multiple
                onChange={(e) => handleFileUpload(e, "video")}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)", boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="px-3 py-1.5 bg-white/10 text-white text-xs rounded-lg font-semibold border border-white/20"
              >
                + Add More
              </motion.div>
            </label>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1 pr-2">
            {videoFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
              >
                {editingVideoIndex === index ? (
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-white/90">
                        Edit Details
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        onClick={() => setEditingVideoIndex(null)}
                        className="text-xs text-white hover:text-white/80 font-semibold"
                      >
                        Done
                      </motion.button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        placeholder="Enter title..."
                        value={file.title || ""}
                        onChange={(e) =>
                          updateFileTitle(index, e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Description
                      </label>
                      <textarea
                        placeholder="Enter description..."
                        value={file.description || ""}
                        onChange={(e) =>
                          updateFileDescription(index, e.target.value)
                        }
                        rows={2}
                        className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none text-white placeholder:text-white/50"
                      />
                    </div>
                    <p className="text-xs text-white/60 truncate">
                      {file.name} • {formatFileSize(file.size)}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">
                        {file.title || "Untitled"}
                      </p>
                      {file.description && (
                        <p className="text-xs text-white/70 mt-0.5 line-clamp-1">
                          {file.description}
                        </p>
                      )}
                      <p className="text-xs text-white/60 mt-1 truncate">
                        {file.name} • {formatFileSize(file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        onClick={() => setEditingVideoIndex(index)}
                        className="p-1.5 rounded-lg group"
                        title="Edit details"
                      >
                        <FiEdit2 className="w-3.5 h-3.5 text-white/70 group-hover:text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.15)" }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        onClick={() => removeFile(index)}
                        className="p-1.5 rounded-lg group"
                        title="Delete video"
                      >
                        <FiX className="w-4 h-4 text-white/70 group-hover:text-red-400" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
