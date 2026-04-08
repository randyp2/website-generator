"use client"

import { useEffect, useState } from "react"
import { FiEdit3, FiEye, FiFileText, FiSave } from "react-icons/fi"

import { cn } from "@/lib/utils"

import { DescriptionMarkdown } from "./DescriptionMarkdown"
import { DESCRIPTION_MAX_LENGTH } from "./wizard/StepDetails"

interface PublishHeroDescriptionPanelProps {
  title: string
  description: string
  onSaveDescription: (nextDescription: string) => Promise<void>
}

const EMPTY_MESSAGE =
  "No description has been added for this portfolio yet. Use Edit description to add one."

export const PublishHeroDescriptionPanel = ({
  title,
  description,
  onSaveDescription,
}: PublishHeroDescriptionPanelProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [mode, setMode] = useState<"description" | "preview">("description")
  const [draft, setDraft] = useState(description)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditing) {
      setDraft(description)
    }
  }, [description, isEditing])

  const hasDescription = description.trim().length > 0
  const hasDraft = draft.trim().length > 0

  const handleStartEdit = () => {
    setDraft(description)
    setMode("description")
    setError(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (isSaving) return
    setDraft(description)
    setError(null)
    setMode("description")
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await onSaveDescription(draft)
      setIsEditing(false)
      setMode("description")
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save description",
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="px-6 pt-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-background/60">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <FiFileText className="h-4 w-4" />
            Description preview
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {isEditing
                ? `${draft.length}/${DESCRIPTION_MAX_LENGTH}`
                : hasDescription
                  ? `${description.trim().length} chars`
                  : "Missing"}
            </span>
            {isEditing ? (
              <>
                <div className="inline-flex items-center rounded-md border border-border bg-background/70 p-0.5">
                  <button
                    type="button"
                    onClick={() => setMode("description")}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium transition-colors",
                      mode === "description"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <FiEdit3 className="h-3 w-3" />
                    Description
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("preview")}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium transition-colors",
                      mode === "preview"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <FiEye className="h-3 w-3" />
                    Preview
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isSaving && "cursor-not-allowed opacity-50",
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border border-primary bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90",
                    isSaving && "cursor-not-allowed opacity-60 hover:bg-primary",
                  )}
                >
                  <FiSave className="h-3 w-3" />
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
              >
                <FiEdit3 className="h-3 w-3" />
                Edit description
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 px-5 py-5 sm:px-6 sm:py-6">
          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {isEditing ? (
            mode === "description" ? (
              <textarea
                value={draft}
                onChange={(event) =>
                  setDraft(event.target.value.slice(0, DESCRIPTION_MAX_LENGTH))
                }
                placeholder="Tell visitors what this portfolio is about. You can use markdown like **bold**, *italic*, and lists."
                className="h-[280px] w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            ) : (
              <div className="h-[280px] overflow-y-auto rounded-xl border border-border bg-background px-3 py-3">
                {hasDraft ? (
                  <DescriptionMarkdown content={draft.trim()} />
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    Nothing to preview yet. Add some markdown text in Description mode.
                  </p>
                )}
              </div>
            )
          ) : hasDescription ? (
            <DescriptionMarkdown
              content={description.trim()}
              className="max-h-[280px] overflow-y-auto pr-1"
            />
          ) : (
            <p className={cn("text-sm leading-relaxed italic text-muted-foreground")}>
              {EMPTY_MESSAGE}
            </p>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
            <FiEdit3 className="h-3.5 w-3.5" />
            Explore card summary source
          </div>
        </div>
      </div>
    </div>
  )
}
