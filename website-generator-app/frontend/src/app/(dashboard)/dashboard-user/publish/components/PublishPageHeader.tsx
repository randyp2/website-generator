"use client"

import { FiGlobe } from "react-icons/fi"

interface PublishPageHeaderProps {
  liveCount: number
  draftCount: number
  onOpenWizard: () => void
}

export const PublishPageHeader = ({
  liveCount,
  draftCount,
  onOpenWizard,
}: PublishPageHeaderProps) => (
  <div className="rounded-2xl border border-border bg-card/70 p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Publish
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Showcase your live portfolio, manage your drafts, and ship updates
          through a guided publish flow.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-emerald-300">
            {liveCount} Live
          </span>
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground">
            {draftCount} Drafts
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenWizard}
        className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiGlobe className="h-4 w-4" />
        Publish portfolio
      </button>
    </div>
  </div>
)
