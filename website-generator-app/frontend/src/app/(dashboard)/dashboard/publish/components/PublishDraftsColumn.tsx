"use client"

import { FiInbox } from "react-icons/fi"

import type { Portfolio } from "@/types/portfolio"

import { PublishListCard } from "./PublishListCard"

interface PublishDraftsColumnProps {
  drafts: Portfolio[]
  ownerName: string
  onSelectDraft: (portfolioId: string) => void
}

export const PublishDraftsColumn = ({
  drafts,
  ownerName,
  onSelectDraft,
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
      <div className="space-y-3">
        {drafts.map((portfolio) => (
          <PublishListCard
            key={String(portfolio.id)}
            portfolio={portfolio}
            variant="draft"
            ownerName={ownerName}
            onClick={() => onSelectDraft(String(portfolio.id))}
          />
        ))}
      </div>
    )}
  </section>
)
