"use client"

import { useState } from "react"
import { FiEdit3, FiEye } from "react-icons/fi"

import { cn } from "@/lib/utils"

import { DescriptionMarkdown } from "../DescriptionMarkdown"

export const DESCRIPTION_MAX_LENGTH = 1000

interface StepDetailsProps {
  descriptionInput: string
  onChange: (value: string) => void
}

export const StepDetails = ({ descriptionInput, onChange }: StepDetailsProps) => {
  const [mode, setMode] = useState<"write" | "preview">("write")
  const hasDescription = descriptionInput.trim().length > 0

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-foreground">Add a description</p>
        <p className="mt-1 text-xs text-muted-foreground">
          A short summary for /explore. Markdown is supported.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-xs font-medium text-muted-foreground">
            Description
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {descriptionInput.length}/{DESCRIPTION_MAX_LENGTH}
            </span>
            <div className="inline-flex items-center rounded-md border border-border bg-background/70 p-0.5">
              <button
                type="button"
                onClick={() => setMode("write")}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium transition-colors",
                  mode === "write"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <FiEdit3 className="h-3 w-3" />
                Write
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
          </div>
        </div>

        {mode === "write" ? (
          <textarea
            value={descriptionInput}
            onChange={(e) => onChange(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
            placeholder="Tell visitors what this portfolio is about. You can use markdown like **bold**, *italic*, and lists."
            className="h-full min-h-[220px] w-full flex-1 resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        ) : (
          <div className="h-full min-h-[220px] w-full flex-1 overflow-y-auto rounded-xl border border-border bg-background px-3 py-3">
            {hasDescription ? (
              <DescriptionMarkdown content={descriptionInput} />
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Nothing to preview yet. Add some markdown text in Write mode.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
