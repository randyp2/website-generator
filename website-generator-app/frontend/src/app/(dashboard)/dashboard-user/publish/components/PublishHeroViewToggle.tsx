"use client"

import { FiFileText, FiImage } from "react-icons/fi"

import { cn } from "@/lib/utils"

export type PublishHeroViewMode = "screenshot" | "description"

interface PublishHeroViewToggleProps {
  mode: PublishHeroViewMode
  onChange: (mode: PublishHeroViewMode) => void
  disabled?: boolean
}

const options: Array<{ id: PublishHeroViewMode; label: string; icon: typeof FiImage }> = [
  { id: "screenshot", label: "Screenshot", icon: FiImage },
  { id: "description", label: "Description", icon: FiFileText },
]

export const PublishHeroViewToggle = ({
  mode,
  onChange,
  disabled = false,
}: PublishHeroViewToggleProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-background/80 p-1",
        disabled && "opacity-50",
      )}
      role="tablist"
      aria-label="Featured view"
    >
      {options.map((option) => {
        const Icon = option.icon
        const active = mode === option.id

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
              disabled && "cursor-not-allowed",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
