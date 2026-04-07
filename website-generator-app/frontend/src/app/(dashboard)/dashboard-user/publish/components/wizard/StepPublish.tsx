"use client"

import { FiCheck, FiCopy, FiExternalLink, FiGlobe, FiLoader } from "react-icons/fi"

import { cn } from "@/lib/utils"

export type PublishActionState = "idle" | "loading" | "success" | "error"

interface StepPublishProps {
  state: PublishActionState
  error: string | null
  slug: string
  publishedSlug: string | null
  onCopyUrl: () => void
  copied: boolean
}

export const StepPublish = ({
  state,
  error,
  slug,
  publishedSlug,
  onCopyUrl,
  copied,
}: StepPublishProps) => {
  const isSuccess = state === "success"
  const isLoading = state === "loading"

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors",
          isSuccess
            ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300"
            : isLoading
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border bg-muted text-muted-foreground",
        )}
      >
        {isLoading ? (
          <FiLoader className="h-7 w-7 animate-spin" />
        ) : isSuccess ? (
          <FiCheck className="h-8 w-8" />
        ) : (
          <FiGlobe className="h-7 w-7" />
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {isSuccess
            ? "You're live!"
            : isLoading
              ? "Publishing..."
              : "Ready to publish"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSuccess
            ? `Your portfolio is now public at /portfolio/${publishedSlug ?? slug}.`
            : isLoading
              ? "Hang tight while we deploy your portfolio."
              : "Click Publish below to share this with the world."}
        </p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {isSuccess && publishedSlug && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={onCopyUrl}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            {copied ? (
              <FiCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <FiCopy className="h-4 w-4" />
            )}
            Copy URL
          </button>
          <a
            href={`/portfolio/${publishedSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <FiExternalLink className="h-4 w-4" />
            View on Explore
          </a>
        </div>
      )}
    </div>
  )
}
