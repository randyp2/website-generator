"use client";

import { UploadedFile } from "@/types/file";
import { formatFileSize } from "@/utils/fileHelpers";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { FiImage, FiUpload, FiCheck, FiEdit2, FiX } from "react-icons/fi";

interface MediaUploadProps {
  mediaFiles: UploadedFile[];
  pendingMediaFiles: UploadedFile[];
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "media" | "video"
  ) => void;
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
  updateFileTitle: (
    type: "media" | "video",
    index: number,
    title: string
  ) => void;
  updateFileDescription: (
    type: "media" | "video",
    index: number,
    description: string
  ) => void;
  removeFile: (
    type: "resume" | "media" | "video",
    index?: number | undefined
  ) => void;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  mediaFiles,
  pendingMediaFiles,
  handleFileUpload,
  updatePendingFileTitle,
  updatePendingFileDescription,
  cancelPendingFiles,
  confirmPendingFiles,
  updateFileTitle,
  updateFileDescription,
  removeFile,
}) => {
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
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex-1 flex flex-col overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-cyan-100 rounded-lg">
          <FiImage className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Media Files</h2>
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
                      updatePendingFileDescription(
                        "media",
                        index,
                        e.target.value
                      )
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
                      <p className="text-xs font-semibold text-slate-700">
                        Edit Details
                      </p>
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
  );
};
