"use client"

import { FiCheck, FiLoader } from "react-icons/fi"
import { toDecorativeProfileSegment } from "@/lib/public-env"

interface StepSlugProps {
  ownerName: string
  slugInput: string
  slugIsValid: boolean
  slugAvailable: boolean | null
  slugChecking: boolean
  isUnchanged: boolean
  onChange: (value: string) => void
}

export const StepSlug = ({
  ownerName,
  slugInput,
  slugIsValid,
  slugAvailable,
  slugChecking,
  isUnchanged,
  onChange,
}: StepSlugProps) => {
  const profileSegment = toDecorativeProfileSegment(ownerName)

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">Choose your URL</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This becomes the public link to your portfolio. Use lowercase letters,
          numbers, and hyphens.
        </p>
      </div>
      <div className="flex items-center overflow-hidden rounded-xl border border-border bg-background transition-colors focus-within:border-primary">
        <span className="whitespace-nowrap border-r border-border bg-muted px-3 py-3 font-mono text-xs text-muted-foreground">
          /{profileSegment}/
        </span>
        <input
          type="text"
          value={slugInput}
          onChange={(e) =>
            onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
          }
          placeholder="your-name"
          autoFocus
          className="flex-1 bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="pr-3">
          {slugChecking && (
            <FiLoader className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {!slugChecking && slugAvailable === true && !isUnchanged && (
            <FiCheck className="h-4 w-4 text-emerald-400" />
          )}
          {!slugChecking && slugAvailable === false && !isUnchanged && (
            <span className="text-xs text-red-400">taken</span>
          )}
        </div>
      </div>
      {slugInput && !slugIsValid && (
        <p className="text-xs text-red-400/80">
          3–64 chars, lowercase letters, numbers, and hyphens.
        </p>
      )}
    </div>
  )
}
