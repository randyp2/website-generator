import { AlertCircle, Info, LoaderCircle } from "lucide-react"

import type { PreviewScreenshotState } from "../../hooks/usePreviewScreenshot"

interface PreviewCaptureNoticeProps {
  state: PreviewScreenshotState
  error: string | null
  external: boolean
  usingPlaceholder: boolean
  onRetry: () => void
}

export const PreviewCaptureNotice = ({
  state,
  error,
  external,
  usingPlaceholder,
  onRetry,
}: PreviewCaptureNoticeProps) => {
  const processing = state === "requesting" || state === "processing"

  if (processing) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
        <LoaderCircle className="mt-0.5 size-3.5 shrink-0 animate-spin text-primary" />
        <p>
          {external
            ? "Capturing your verified website now. This preview will update automatically when the background worker finishes."
            : "Capturing the active generated version now. This preview will update automatically when the background worker finishes."}
        </p>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
        <div className="flex flex-1 items-center justify-between gap-3">
          <p>{error ?? "The portfolio preview could not be captured."}</p>
          {external && (
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 cursor-pointer font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!usingPlaceholder) return null

  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <p>
        {external
          ? "The image below is a placeholder while your verified website preview starts."
          : "The image below is a placeholder while your generated portfolio preview starts."}
      </p>
    </div>
  )
}
