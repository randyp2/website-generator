"use client";

import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { UploadedFile } from "@/types/file";
import { formatMaxSizeLabel } from "@/lib/portfolio/portfolioUploadPolicy";
import { formatFileSize } from "@/utils/fileHelpers";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FiImage, FiUpload, FiCheck, FiEdit2, FiX } from "react-icons/fi";

interface MediaUploadProps {
  pendingMediaFiles: UploadedFile[];
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
  updatePendingFileSectionHint: (
    type: "media" | "video",
    index: number,
    sectionHint: string
  ) => void;
  cancelPendingFiles: (type: "media" | "video") => void;
  confirmPendingFiles: (type: "media" | "video") => void;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "media" | "video"
  ) => void;
  updateFileSectionHint: (
    type: "media" | "video",
    index: number,
    sectionHint: string
  ) => void;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  pendingMediaFiles,
  updatePendingFileTitle,
  updatePendingFileDescription,
  updatePendingFileSectionHint,
  cancelPendingFiles,
  confirmPendingFiles,
  handleFileUpload,
  updateFileSectionHint,
}) => {
  useEffect(() => {
  const unsub = usePortfolioStore.subscribe((state, prevState) => {
    console.log("Zustand updated:");
    console.log("Previous:", prevState);
    console.log("Current:", state);
  });
  return () => unsub(); // cleanup on unmount
}, []);

  const mediaFiles = usePortfolioStore(s => s.mediaFiles);
  const updateFileTitle = usePortfolioStore(s => s.updateMediaFileTitle);
  const updateFileDescription = usePortfolioStore(s => s.updateMediaFileDescription);
  const removeFile = usePortfolioStore(s => s.removeMediaFile);

  const sectionHintOptions = [
    "hero",
    "about",
    "projects",
    "gallery",
    "contact",
    "other",
  ];
  /**
   * STATE: Currently editing media file index
   *
   * Tracks which media file is currently being edited in the list view.
   * When a user clicks "edit" on a confirmed media file, this state stores
   * the array index of that file to show the edit form inline.
   *
   * - Type: number | null
   * - Initial value: null (no file being edited)
   * - Set to file index when edit button clicked
   * - Reset to null when user clicks "Done" or cancels editing
   */
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(
    null
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.2 }}
      className="relative bg-white/5 rounded-2xl p-6 shadow-lg border border-white/10 flex-1 flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2 bg-white/10 rounded-lg border border-white/20">
          <FiImage className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Media Files</h2>
          <p className="text-sm text-white/60">
            JPG, PNG images • up to {formatMaxSizeLabel("image")}
          </p>
        </div>
      </div>

      {/* Base Upload Card - Show when no files uploaded and no pending */}
      {mediaFiles.length === 0 && pendingMediaFiles.length === 0 && (
        <label className="flex-1 flex items-center justify-center relative z-10">
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            multiple
            onChange={(e) => handleFileUpload(e, "media")}
            className="hidden"
          />
          <motion.div
            whileHover={{ scale: 1.01, borderColor: "rgba(255, 255, 255, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="border-2 border-dashed border-white/20 rounded-xl p-8 w-full text-center cursor-pointer"
          >
            <FiUpload className="w-12 h-12 text-white/70 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              Click to upload images
            </p>
            <p className="text-sm text-white/60">
              Supports JPG and PNG files up to {formatMaxSizeLabel("image")} each
              (multiple allowed)
            </p>
          </motion.div>
        </label>
      )}

      {/* Title Entry Form - Show when files are pending */}
      {pendingMediaFiles.length > 0 && (
        <div className="flex flex-col flex-1 min-h-0 relative z-10">
          <div className="mb-3 pb-2 border-b border-white/20">
            <p className="text-sm font-semibold text-white/90">
              Add details for your images
            </p>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2 mb-4">
            {pendingMediaFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <FiImage className="w-4 h-4 text-white/70 mt-1" />
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
                      updatePendingFileTitle("media", index, e.target.value)
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
                        "media",
                        index,
                        e.target.value
                      )
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none text-white placeholder:text-white/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Section Hint
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <select
                      value={file.sectionHint || ""}
                      onChange={(e) =>
                        updatePendingFileSectionHint(
                          "media",
                          index,
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white"
                    >
                      <option value="">Select a section</option>
                      {sectionHintOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Custom hint (optional)"
                      value={
                        file.sectionHint &&
                        !sectionHintOptions.includes(file.sectionHint)
                          ? file.sectionHint
                          : ""
                      }
                      onChange={(e) =>
                        updatePendingFileSectionHint(
                          "media",
                          index,
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={() => cancelPendingFiles("media")}
              className="flex-1 px-4 py-2 bg-white/5 text-white/90 rounded-lg font-semibold border border-white/20"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)", boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={() => confirmPendingFiles("media")}
              className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg font-semibold border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              Confirm
            </motion.button>
          </div>
        </div>
      )}

      {/* List View - Show when files are stored */}
      {mediaFiles.length > 0 && pendingMediaFiles.length === 0 && (
        <div className="flex flex-col flex-1 min-h-0 relative z-10">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
            <p className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
              {mediaFiles.length} {mediaFiles.length === 1 ? "Image" : "Images"}{" "}
              Stored
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleFileUpload(e, "media")}
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
            {mediaFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
              >
                {editingMediaIndex === index ? (
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-white/90">
                        Edit Details
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        onClick={() => setEditingMediaIndex(null)}
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
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Section Hint
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <select
                          value={file.sectionHint || ""}
                          onChange={(e) =>
                            updateFileSectionHint(
                              "media",
                              index,
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white"
                        >
                          <option value="">Select a section</option>
                          {sectionHintOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Custom hint (optional)"
                          value={
                            file.sectionHint &&
                            !sectionHintOptions.includes(file.sectionHint)
                              ? file.sectionHint
                              : ""
                          }
                          onChange={(e) =>
                            updateFileSectionHint(
                              "media",
                              index,
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white placeholder:text-white/50"
                        />
                      </div>
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
                        onClick={() => setEditingMediaIndex(index)}
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
                        title="Delete image"
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
