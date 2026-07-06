"use client"

import { useCallback, useRef, useState } from "react"
import { motion } from "framer-motion"
import { FileText, Upload } from "lucide-react"

import type { ResumeFile } from "./verification.types"

const ACCEPTED_RESUME_EXTENSIONS = [".pdf", ".docx"] as const

interface ResumeUploadGateProps {
  onResumeUploaded: (file: ResumeFile) => void
}

const formatFileSize = (sizeInBytes: number): string =>
  `${(sizeInBytes / 1024).toFixed(1)} KB`

const isAcceptedResumeFile = (fileName: string): boolean => {
  const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase()
  return ACCEPTED_RESUME_EXTENSIONS.includes(
    extension as (typeof ACCEPTED_RESUME_EXTENSIONS)[number],
  )
}

const ResumeUploadGate = ({ onResumeUploaded }: ResumeUploadGateProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const completeUpload = useCallback(
    (file: File, objectUrl: string) => {
      onResumeUploaded({
        name: file.name,
        size: formatFileSize(file.size),
        url: objectUrl,
        file,
      })
    },
    [onResumeUploaded],
  )

  const processFile = useCallback(
    (file: File) => {
      if (!isAcceptedResumeFile(file.name)) {
        return
      }

      const objectUrl = URL.createObjectURL(file)
      completeUpload(file, objectUrl)
    },
    [completeUpload],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragOver(false)

      const file = event.dataTransfer.files[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile],
  )

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile],
  )

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-6 rounded-full bg-primary/10 p-6">
        <FileText className="h-16 w-16 text-primary" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">
        Upload Your Resume
      </h2>
      <p className="mb-10 max-w-md text-center text-muted-foreground">
        Upload your resume to unlock skill verification. We&apos;ll extract your
        skills and cross-reference them against your connected accounts and
        evidence.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full max-w-lg cursor-pointer rounded-xl border-2 border-dashed p-12 transition-all ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_RESUME_EXTENSIONS.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-center">
          <motion.div
            animate={dragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
          >
            <Upload className="h-8 w-8 text-primary" />
          </motion.div>
          <p className="mb-1 text-sm font-semibold text-foreground">
            Drop your resume here, or <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">PDF or DOCX, max 5MB</p>
        </div>

      </div>
    </div>
  )
}

export default ResumeUploadGate
