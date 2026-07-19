"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiEdit3, FiEye } from "react-icons/fi"

import { cn } from "@/lib/utils"

import { DescriptionMarkdown } from "../DescriptionMarkdown"

export const DESCRIPTION_MAX_LENGTH = 1000

const MODES = [
  { key: "write", label: "Write", Icon: FiEdit3 },
  { key: "preview", label: "Preview", Icon: FiEye },
] as const

type DetailsMode = (typeof MODES)[number]["key"]

interface StepDetailsProps {
  descriptionInput: string
  onChange: (value: string) => void
}

export const StepDetails = ({ descriptionInput, onChange }: StepDetailsProps) => {
  const [mode, setMode] = useState<DetailsMode>("write")
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
          <div className="inline-flex items-center rounded-full border border-border bg-background/70 p-0.5">
            {MODES.map(({ key, label, Icon }) => {
              const active = mode === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={cn(
                    "relative inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="detailsModeThumb"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 34 }}
                    />
                  )}
                  <Icon className="relative z-10 h-3 w-3" />
                  <span className="relative z-10">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          {mode === "write" ? (
            <textarea
              value={descriptionInput}
              onChange={(e) => onChange(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
              placeholder="Tell visitors what this portfolio is about. You can use markdown like **bold**, *italic*, and lists."
              className="h-full min-h-[220px] w-full flex-1 resize-none rounded-xl border border-border bg-background px-3 py-3 pb-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          ) : (
            <div className="h-full min-h-[220px] w-full flex-1 overflow-y-auto rounded-xl border border-border bg-background px-3 py-3 pb-9">
              {hasDescription ? (
                <DescriptionMarkdown content={descriptionInput} />
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  Nothing to preview yet. Add some markdown text in Write mode.
                </p>
              )}
            </div>
          )}
          <span className="pointer-events-none absolute bottom-2.5 right-3 rounded-md bg-background/80 px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground backdrop-blur-sm">
            {descriptionInput.length}/{DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
      </div>
    </div>
  )
}
