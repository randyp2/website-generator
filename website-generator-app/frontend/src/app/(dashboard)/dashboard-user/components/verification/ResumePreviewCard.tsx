"use client"

import { FileText, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { ResumeFile } from "./verification.types"

interface ResumePreviewCardProps {
  resume: ResumeFile
  onRemove: () => void
}

const ResumePreviewCard = ({
  resume,
  onRemove,
}: ResumePreviewCardProps) => {
  const isPdf = resume.name.toLowerCase().endsWith(".pdf")

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {resume.name}
            </p>
            <p className="text-xs text-muted-foreground">{resume.size}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {isPdf ? (
        <iframe
          src={resume.url}
          title="Resume Preview"
          className="h-[600px] w-full rounded-lg border"
        />
      ) : (
        <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border bg-muted">
          <FileText className="mb-3 h-16 w-16 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Preview not available for DOCX files
          </p>
          <a
            href={resume.url}
            download={resume.name}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Download to view
          </a>
        </div>
      )}
    </div>
  )
}

export default ResumePreviewCard
