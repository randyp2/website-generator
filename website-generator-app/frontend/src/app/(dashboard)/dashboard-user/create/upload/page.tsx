"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import { HeaderSection } from "./components/HeaderSection";
import { ResumeUpload } from "./components/ResumeUpload";
import { UploadedFile } from "@/types/file";
import { formatFileSize } from "@/utils/fileHelpers";
import { MediaUpload } from "./components/MediaUpload";
import { VideoUpload } from "./components/VideoUpload";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { useUser } from "@/context/UserContext";

const UploadPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * STATE: Global zustand store for portfolio creation
   *
   * Holds all state related to the portfolio being created, including:
   * - Selected template ID
   * - Uploaded resume, media, and video files
   * - AI prompt and generated preview HTML
   *
   * Provides functions to update each piece of state.
   */
  const {
    templateId,
    resumeFile,

    setTemplateId,
    setPortfolioId,
    setResumeFile,
    addMediaFiles,
    removeMediaFile,
    updateMediaFileTitle,
    updateMediaFileDescription,
    addVideoFiles,
    removeVideoFile,
    updateVideoFileTitle,
    updateVideoFileDescription,
  } = usePortfolioStore();

  useEffect(() => {
    const id = searchParams.get("templateId");
    if (id) setTemplateId(id);
  }, [searchParams, setTemplateId]);

  useEffect(() => {
    const unsub = usePortfolioStore.subscribe((state, prevState) => {
      console.log("Zustand updated:");
      console.log("Previous:", prevState);
      console.log("Current:", state);
    });
    return () => unsub(); // cleanup on unmount
  }, []);

  /**
   * STATE: Pending media files awaiting metadata input
   *
   * Temporarily stores media files that have just been uploaded but haven't
   * been confirmed yet. When files are uploaded, they go here first, allowing
   * the user to add titles and descriptions before confirming them.
   *
   * - Type: UploadedFile[] (array of file objects)
   * - Initial value: [] (empty array)
   * - Workflow: Upload → pendingMediaFiles → Add metadata → Confirm → mediaFiles
   * - Cleared when user confirms or cancels the pending files
   */
  const [pendingMediaFiles, setPendingMediaFiles] = useState<UploadedFile[]>(
    []
  );

  /**
   * STATE: Pending video files awaiting metadata input
   *
   * Temporarily stores video files that have just been uploaded but haven't
   * been confirmed yet. When files are uploaded, they go here first, allowing
   * the user to add titles and descriptions before confirming them.
   *
   * - Type: UploadedFile[] (array of file objects)
   * - Initial value: [] (empty array)
   * - Workflow: Upload → pendingVideoFiles → Add metadata → Confirm → videoFiles
   * - Cleared when user confirms or cancels the pending files
   */
  const [pendingVideoFiles, setPendingVideoFiles] = useState<UploadedFile[]>(
    []
  );

  /**
   * HANDLER: File upload for resume, media, and video files
   *
   * Processes file uploads from the file input elements. This function handles
   * three different types of uploads and routes them to the appropriate state.
   *
   * Behavior by type:
   * - "resume": Directly sets the resume file (only accepts first file)
   * - "media": Adds files to pendingMediaFiles for metadata collection
   * - "video": Adds files to pendingVideoFiles for metadata collection
   *
   * Process flow:
   * 1. Retrieves files from the input event
   * 2. Converts FileList to an array of UploadedFile objects
   * 3. Initializes title and description as empty strings
   * 4. Routes files to appropriate state based on type
   * 5. Resets the input value to allow re-uploading the same file
   *
   * @param e - File input change event containing the selected files
   * @param type - Category of file: "resume" (single), "media" (multiple), or "video" (multiple)
   * @returns void
   */
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "media" | "video"
  ) => {
    const files = e.target.files;
    if (!files) return;

    // Convert FileList to array and create UploadedFile objects
    const fileArray = Array.from(files).map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      title: "",
      description: "",
    }));

    if (type === "resume") {
      // Resume: directly set the first file (single file upload)
      setResumeFile(fileArray[0]);
    } else if (type === "media") {
      // Media: route to pending state for metadata input
      setPendingMediaFiles(fileArray);
    } else if (type === "video") {
      // Video: route to pending state for metadata input
      setPendingVideoFiles(fileArray);
    }

    // Reset input to allow uploading the same file again if needed
    e.target.value = "";
  };

  /**
   * HANDLER: Remove a file from the confirmed files list
   *
   * Deletes a file from the appropriate state array based on the file type.
   * This function is called when the user clicks the delete (X) button on
   * a file in the confirmed files list.
   *
   * Behavior by type:
   * - "resume": Removes the single resume file (sets to null)
   * - "media": Removes a specific media file at the given index
   * - "video": Removes a specific video file at the given index
   *
   * Uses the filter method to create a new array without the specified file,
   * which maintains immutability and triggers React re-renders.
   *
   * @param type - Category of file to remove: "resume", "media", or "video"
   * @param index - (Optional) Array index of the file to remove (required for media/video)
   * @returns void
   */
  const removeFile = (type: "resume" | "media" | "video", index?: number) => {
    if (type === "resume") {
      // Resume: clear the single file
      setResumeFile(null);
    } else if (type === "media" && index !== undefined) {
      // Media: filter out the file at the specified index
      removeMediaFile(index);
    } else if (type === "video" && index !== undefined) {
      // Video: filter out the file at the specified index
      removeVideoFile(index);
    }
  };

  /**
   * HANDLER: Update title of a confirmed file
   *
   * Updates the title property of a specific file in the confirmed files list.
   * This function is called when the user edits the title of an already-confirmed
   * media or video file in the list view.
   *
   * Uses the map method to create a new array with the updated file object,
   * preserving all other properties using the spread operator (...file).
   * Only the file at the specified index is modified; all others remain unchanged.
   *
   * @param type - File category: "media" or "video"
   * @param index - Array index of the file to update
   * @param title - New title string to set for the file
   * @returns void
   */
  const updateFileTitle = (
    type: "media" | "video",
    index: number,
    title: string
  ) => {
    if (type === "media") {
      // Update title for media file at specified index
      updateMediaFileTitle(index, title);
    } else if (type === "video") {
      // Update title for video file at specified index
      updateVideoFileTitle(index, title);
    }
  };

  /**
   * HANDLER: Update title of a pending file awaiting confirmation
   *
   * Updates the title property of a file that is in the pending state (not yet confirmed).
   * This function is called when the user types into the title input field during the
   * metadata collection phase, immediately after file upload.
   *
   * Works with pendingMediaFiles or pendingVideoFiles state, not the confirmed files.
   * Uses map to immutably update only the file at the specified index.
   *
   * @param type - File category: "media" or "video"
   * @param index - Array index of the pending file to update
   * @param title - New title string entered by the user
   * @returns void
   */
  const updatePendingFileTitle = (
    type: "media" | "video",
    index: number,
    title: string
  ) => {
    if (type === "media") {
      // Update title for pending media file at specified index
      setPendingMediaFiles((prev) =>
        prev.map((file, i) => (i === index ? { ...file, title } : file))
      );
    } else if (type === "video") {
      // Update title for pending video file at specified index
      setPendingVideoFiles((prev) =>
        prev.map((file, i) => (i === index ? { ...file, title } : file))
      );
    }
  };

  /**
   * HANDLER: Update description of a pending file awaiting confirmation
   *
   * Updates the description property of a file in the pending state (not yet confirmed).
   * This function is called when the user types into the description textarea during
   * the metadata collection phase, right after uploading files.
   *
   * Similar to updatePendingFileTitle but for the description field.
   * Works with pendingMediaFiles or pendingVideoFiles state arrays.
   * Uses map to create a new array with only the target file's description updated.
   *
   * @param type - File category: "media" or "video"
   * @param index - Array index of the pending file to update
   * @param description - New description text entered by the user
   * @returns void
   */
  const updatePendingFileDescription = (
    type: "media" | "video",
    index: number,
    description: string
  ) => {
    if (type === "media") {
      // Update description for pending media file at specified index
      setPendingMediaFiles((prev) =>
        prev.map((file, i) => (i === index ? { ...file, description } : file))
      );
    } else if (type === "video") {
      // Update description for pending video file at specified index
      setPendingVideoFiles((prev) =>
        prev.map((file, i) => (i === index ? { ...file, description } : file))
      );
    }
  };

  /**
   * HANDLER: Update description of a confirmed file
   *
   * Updates the description property of a file in the confirmed files list.
   * This function is called when the user edits the description of an already-confirmed
   * media or video file in the list view edit mode.
   *
   * Works with the confirmed mediaFiles or videoFiles state (not pending files).
   * Uses map to immutably update the file object at the specified index while
   * preserving all other files in the array.
   *
   * @param type - File category: "media" or "video"
   * @param index - Array index of the confirmed file to update
   * @param description - New description text to set for the file
   * @returns void
   */
  const updateFileDescription = (
    type: "media" | "video",
    index: number,
    description: string
  ) => {
    if (type === "media") {
      // Update description for confirmed media file at specified index
      updateMediaFileDescription(index, description);
    } else if (type === "video") {
      // Update description for confirmed video file at specified index
      updateVideoFileDescription(index, description);
    }
  };

  /**
   * HANDLER: Confirm and finalize pending files
   *
   * Moves files from the pending state to the confirmed state after the user
   * has added metadata (title and description) and clicked the "Confirm" button.
   *
   * Process flow:
   * 1. Appends all pending files to the confirmed files array using spread operator
   * 2. Clears the pending files array, hiding the metadata input form
   * 3. Shows the confirmed files in the list view
   *
   * This creates a two-step upload process:
   * - Step 1: Upload files → pending state (user adds metadata)
   * - Step 2: Confirm → confirmed state (files appear in final list)
   *
   * @param type - File category to confirm: "media" or "video"
   * @returns void
   */
  const confirmPendingFiles = (type: "media" | "video") => {
    if (type === "media") {
      // Append pending media files to confirmed media files
      addMediaFiles(pendingMediaFiles);
      // Clear pending media files
      setPendingMediaFiles([]);
    } else if (type === "video") {
      // Append pending video files to confirmed video files
      addVideoFiles(pendingVideoFiles);
      // Clear pending video files
      setPendingVideoFiles([]);
    }
  };

  /**
   * HANDLER: Cancel and discard pending files
   *
   * Discards all pending files without confirming them when the user clicks
   * the "Cancel" button during the metadata input phase.
   *
   * This allows users to abort the upload if they:
   * - Uploaded wrong files
   * - Changed their mind about adding these files
   * - Want to start over with different files
   *
   * The files are removed from pending state, returning the UI to the
   * initial upload state. No files are added to the confirmed list.
   *
   * @param type - File category to cancel: "media" or "video"
   * @returns void
   */
  const cancelPendingFiles = (type: "media" | "video") => {
    if (type === "media") {
      // Clear all pending media files (discards upload)
      setPendingMediaFiles([]);
    } else if (type === "video") {
      // Clear all pending video files (discards upload)
      setPendingVideoFiles([]);
    }
  };

  // Handler to navigate to next page
  const handleContinue = async () => {

    //  --- Call API Route to update Supbase Database
    // alert("User id: " + id);
    // Extract current state values
    try {
      const {
        templateId,
        resumeFile,
        mediaFiles,
        videoFiles
      } = usePortfolioStore.getState();


      if (!templateId || !resumeFile) {
        alert("Please select a template and upload a resume before continuing.");
        return;
      }

      // -- Construct form data to send to API route
      const formData = new FormData();
      formData.append("templateId", templateId);
      formData.append("resumeFile", resumeFile.file);

      mediaFiles.forEach((mediaFile) => {
        formData.append("mediaFiles", mediaFile.file);
      });

      videoFiles.forEach((videoFile) => {
        formData.append("videoFiles", videoFile.file);
      });

      // -- Call the API route to create portfolio
      const res = await fetch("/api/portfolio/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("API Error:", error);
        alert("Upload failes: " + error.error);
        return;
      }

      const data = await res.json();
      console.log("UPLOADED RESPONSE: ", data);

      const portfolioId = data.portfolio?.id ?? data.portfolioId;

      if (!portfolioId) {
        alert("Portfolio ID missing from response");
        return;
      }

      // Save portfolio ID to Zustand store for later use
      setPortfolioId(portfolioId);

      router.push(`/dashboard-user/create/review?templateId=${templateId}`);

    } catch (error) {
      console.error("Error during portfolio creation:", error);
      alert("An error occurred while creating the portfolio. Please try again.");
      return;
    }
    
  };

  // Handler to skip upload and navigate to next page
  const handleSkip = () => {
    router.push(`/dashboard-user/create/refine?templateId=${templateId}`);
  };

  return (
    <div className="min-h-screen p-10 pb-32">
      {/* Header */}
      <HeaderSection />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)] min-h-[800px]">
        {/* Left Column - Resume Upload (Full Height) */}
        <ResumeUpload
          handleFileUpload={handleFileUpload}
          formatFileSize={formatFileSize}
          removeFile={removeFile}
        />

        {/* Right Column - Media and Video Uploads Stacked */}
        <div className="flex flex-col gap-6 h-full">
          {/* Media Files Upload */}
          <MediaUpload
            pendingMediaFiles={pendingMediaFiles}
            updatePendingFileTitle={updatePendingFileTitle}
            updatePendingFileDescription={updatePendingFileDescription}
            cancelPendingFiles={cancelPendingFiles}
            confirmPendingFiles={confirmPendingFiles}
            handleFileUpload={handleFileUpload}
          />

          {/* Video Files Upload */}
          <VideoUpload
            pendingVideoFiles={pendingVideoFiles}
            updatePendingFileTitle={updatePendingFileTitle}
            updatePendingFileDescription={updatePendingFileDescription}
            cancelPendingFiles={cancelPendingFiles}
            confirmPendingFiles={confirmPendingFiles}
            handleFileUpload={handleFileUpload}
          />
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
                Continue to revise/edit
              <FiArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default UploadPage;
