"use client"

import { FolderOpen } from "lucide-react"

const EvidenceTabEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
      <FolderOpen className="h-7 w-7 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">No evidence yet</p>
    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
      Upload a resume, portfolio, or certificate from the Skill Verification tab
      and the AI will analyze it and link it to your skills here.
    </p>
  </div>
)

export default EvidenceTabEmptyState
