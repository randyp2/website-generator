"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FiFile, FiUpload, FiCheck, FiX } from "react-icons/fi";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
// Import react-pdf components for PDF rendering
import { Document, Page, pdfjs } from "react-pdf";
// Import styles for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


// Configure PDF.js worker for rendering PDFs
// This worker handles the heavy lifting of PDF parsing and rendering
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ResumeUploadProps {

 
  formatFileSize: (bytes: number) => string;
  removeFile: (
    type: "resume" | "media" | "video",
    index?: number | undefined
  ) => void;
   handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "media" | "video"
  ) => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  formatFileSize,
  removeFile,
  handleFileUpload,
}) => {
  // Get resume file and parsed data setter from global store
  const resumeFile = usePortfolioStore(s => s.resumeFile);
  const setParsedResumeData = usePortfolioStore(s => s.setParsedResumeData);

  // State to track the number of pages in the PDF
  const [numPages, setNumPages] = useState<number>(0);
  // State to store the preview URL created from the uploaded file
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create a preview URL when a resume file is uploaded
  useEffect(() => {
    if (resumeFile?.file) {
      // Create an object URL from the file blob for preview
      const url = URL.createObjectURL(resumeFile.file);
      setPreviewUrl(url);

      // TODO: Call backend to parse the resume
      parseResume(resumeFile.file);

      // Cleanup function to revoke the object URL when component unmounts
      // or when the file changes to prevent memory leaks
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [resumeFile]);

  /**
   * Sends the uploaded resume to the backend for parsing
   * This will extract structured data from the resume (name, email, skills, etc.)
   */
  const parseResume = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const data = await response.json();
      console.log("Parsed resume data:", data);

      // Store parsed data in Zustand store
      if (data.success && data.data) {
        setParsedResumeData(data.data);
        console.log("Resume data saved to store");
      }

    } catch (error) {
      console.error("Error parsing resume:", error);
      // TODO: Show error toast/notification to user
    }
  };

  /**
   * Callback fired when PDF document loads successfully
   * Stores the total number of pages in the document
   */
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  /**
   * Check if the uploaded file is a PDF based on file type
   */
  const isPDF = resumeFile?.type === "application/pdf";
  return (
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
          <h2 className="text-xl font-bold text-slate-900">Resume / CV</h2>
          <p className="text-sm text-slate-500">PDF or DOCX format</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {!resumeFile ? (
          // Upload area - shown when no file is uploaded
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
                Supports PDF files
              </p>
            </motion.div>
          </label>
        ) : (
          // Preview area - shown when file is uploaded
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col"
          >
            {/* File info header with delete button */}
            <div className="flex items-center justify-between p-4 bg-sky-50 rounded-xl border border-sky-200 mb-4">
              <div className="flex items-center gap-3">
                <FiCheck className="w-5 h-5 text-sky-600" />
                <div>
                  <p className="font-semibold text-slate-900">
                    {resumeFile.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatFileSize(resumeFile.size)}
                    {/* Show page count for PDFs */}
                    {isPDF && numPages > 0 && ` • ${numPages} page${numPages > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile("resume")}
                className="p-2 hover:bg-sky-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* PDF Preview Section */}
            <div className="flex-1 flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden">
              {isPDF && previewUrl ? (
                // Render PDF preview for PDF files
                <div className="w-full h-full flex items-center justify-center p-4">
                  <Document
                    file={previewUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex items-center justify-center"
                    loading={
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
                        <p className="text-slate-600">Loading PDF preview...</p>
                      </div>
                    }
                    error={
                      <div className="flex flex-col items-center justify-center text-slate-600">
                        <FiFile className="w-12 h-12 mb-2" />
                        <p>Unable to preview PDF</p>
                        <p className="text-sm text-slate-500">{resumeFile.name}</p>
                      </div>
                    }
                  >
                    {/* Render only the first page as a preview */}
                    <Page
                      pageNumber={1}
                      className="shadow-lg"
                      // Scale the PDF to fit the container
                      // You can adjust this value to make it larger/smaller
                      width={Math.min(window.innerWidth * 0.35, 500)}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </Document>
                </div>
              ) : (
                // Fallback for non-PDF files (DOCX)
                <div className="flex flex-col items-center justify-center text-slate-600">
                  <FiFile className="w-16 h-16 mb-4 text-slate-400" />
                  <p className="font-semibold">Preview not available</p>
                  <p className="text-sm text-slate-500">DOCX files cannot be previewed</p>
                  <p className="text-xs text-slate-400 mt-2">{resumeFile.name}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
