"use client"

import { FiInbox, FiPlus } from "react-icons/fi"

import type { Portfolio } from "@/types/portfolio"

import { PublishDraftCard } from "./PublishDraftCard"

interface PublishDraftsColumnProps {
  drafts: Portfolio[]
  onSelectDraft: (portfolioId: string) => void
  onCreateNew: () => void
}

export const PublishDraftsColumn = ({
  drafts,
  onSelectDraft,
  onCreateNew,
}: PublishDraftsColumnProps) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Drafts — ready to publish
      </h2>
      <span className="text-xs text-muted-foreground">{drafts.length}</span>
    </div>
    {drafts.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
        <FiInbox className="h-7 w-7 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No drafts</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Every portfolio you have is already live. Create a new portfolio to
          start a draft.
        </p>
      </div>
    ) : (
      <div className="space-y-2.5">
        {drafts.map((portfolio) => (
          <PublishDraftCard
            key={String(portfolio.id)}
            portfolio={portfolio}
            onClick={() => onSelectDraft(String(portfolio.id))}
          />
        ))}
        <button
          type="button"
          onClick={onCreateNew}
          className="group flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-transparent px-3.5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:cursor-pointer hover:border-primary/50 hover:bg-muted/30 hover:text-foreground"
        >
          <FiPlus className="h-3.5 w-3.5" />
          New draft
        </button>
      </div>
    )}
  </section>
)
