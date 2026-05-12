"use client"

import { useMemo, useState } from "react"
import { LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"

import EvidenceDetailDialog from "../EvidenceDetailDialog"
import type { EvidenceItem } from "../verification.types"
import type { EvidenceProviderCategory, EvidenceSource, EvidenceViewMode } from "./evidence-tab.types"
import type { EvidenceDocument } from "./evidence-tab.types"
import type { EvidenceTabPanelProps } from "./evidence-tab.types"
import EvidenceTabStatsBar from "./EvidenceTabStatsBar"
import EvidenceSourceSidebar from "./EvidenceSourceSidebar"
import EvidenceDocumentGrid from "./EvidenceDocumentGrid"
import EvidenceTabEmptyState from "./EvidenceTabEmptyState"
import EvidenceProviderFilter from "./EvidenceProviderFilter"
import {
  toEvidenceDocument,
  buildSourceFilters,
  filterDocuments,
  filterByProviderCategory,
  deriveStats,
  deriveProviderCategoryCounts,
} from "./evidence-tab.utils"

// ─── View mode toggle ─────────────────────────────────────────────────────────

interface ViewModeToggleProps {
  active: EvidenceViewMode
  onChange: (mode: EvidenceViewMode) => void
}

const ViewModeToggle = ({ active, onChange }: ViewModeToggleProps) => (
  <div className="flex items-center rounded-md border border-border bg-muted p-0.5">
    <button
      onClick={() => onChange("grid")}
      className={cn(
        "flex items-center rounded px-2 py-1 transition-colors hover:cursor-pointer",
        active === "grid"
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
      aria-label="Grid view"
    >
      <LayoutGrid className="h-3.5 w-3.5" />
    </button>
    <button
      onClick={() => onChange("list")}
      className={cn(
        "flex items-center rounded px-2 py-1 transition-colors hover:cursor-pointer",
        active === "list"
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
      aria-label="List view"
    >
      <List className="h-3.5 w-3.5" />
    </button>
  </div>
)

// ─── Evidence detail adapter ──────────────────────────────────────────────────
// EvidenceDetailDialog expects an EvidenceItem, but we work with EvidenceDocument
// internally. Map back so we can reuse the existing dialog without forking it.

const toEvidenceItemForDialog = (
  doc: EvidenceDocument,
  originalItems: EvidenceItem[],
): EvidenceItem | null => {
  return originalItems.find((item) => item.id === doc.id) ?? null
}

// ─── Panel ────────────────────────────────────────────────────────────────────

const EvidenceTabPanel = ({ evidence, isLoading, error }: EvidenceTabPanelProps) => {
  const [providerCategory, setProviderCategory] = useState<EvidenceProviderCategory>("all")
  const [activeSource, setActiveSource] = useState<EvidenceSource | "all">("all")
  const [viewMode, setViewMode] = useState<EvidenceViewMode>("grid")
  const [selectedDoc, setSelectedDoc] = useState<EvidenceDocument | null>(null)

  const documents = useMemo(
    () => evidence.map(toEvidenceDocument),
    [evidence],
  )

  // Provider category filter is applied first, then the source sidebar refines within it.
  const categoryFilteredDocuments = useMemo(
    () => filterByProviderCategory(documents, providerCategory),
    [documents, providerCategory],
  )

  const providerCategoryCounts = useMemo(
    () => deriveProviderCategoryCounts(documents),
    [documents],
  )

  // Source sidebar options are derived from the category-filtered set so counts stay accurate.
  const sourceFilters = useMemo(
    () => buildSourceFilters(categoryFilteredDocuments),
    [categoryFilteredDocuments],
  )

  const filteredDocuments = useMemo(
    () => filterDocuments(categoryFilteredDocuments, activeSource),
    [categoryFilteredDocuments, activeSource],
  )

  const stats = useMemo(() => deriveStats(documents), [documents])

  // Reset source filter when provider category changes so stale selections don't persist.
  const handleProviderCategoryChange = (category: EvidenceProviderCategory) => {
    setProviderCategory(category)
    setActiveSource("all")
  }

  const selectedEvidenceItem = useMemo(
    () => (selectedDoc ? toEvidenceItemForDialog(selectedDoc, evidence) : null),
    [selectedDoc, evidence],
  )

  const handleDocumentClick = (doc: EvidenceDocument) => {
    setSelectedDoc(doc)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) setSelectedDoc(null)
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Loading evidence...
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 text-center text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (documents.length === 0) {
    return <EvidenceTabEmptyState />
  }

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <EvidenceTabStatsBar
        total={stats.total}
        linked={stats.linked}
        unlinked={stats.unlinked}
        aiVerified={stats.aiVerified}
      />

      {/* Provider category filter */}
      <EvidenceProviderFilter
        active={providerCategory}
        counts={providerCategoryCounts}
        onChange={handleProviderCategoryChange}
      />

      {/* Main layout: sidebar + document area */}
      <div className="flex gap-6">
        {/* Source sidebar */}
        <EvidenceSourceSidebar
          filters={sourceFilters}
          active={activeSource}
          onChange={setActiveSource}
        />

        {/* Document area */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {filteredDocuments.length}{" "}
              {filteredDocuments.length === 1 ? "document" : "documents"}
            </p>
            <ViewModeToggle active={viewMode} onChange={setViewMode} />
          </div>

          {/* Grid or list */}
          <EvidenceDocumentGrid
            documents={filteredDocuments}
            viewMode={viewMode}
            onDocumentClick={handleDocumentClick}
          />
        </div>
      </div>

      {/* Reuse existing detail dialog */}
      <EvidenceDetailDialog
        evidence={selectedEvidenceItem}
        onOpenChange={handleDialogClose}
      />
    </div>
  )
}

export default EvidenceTabPanel
