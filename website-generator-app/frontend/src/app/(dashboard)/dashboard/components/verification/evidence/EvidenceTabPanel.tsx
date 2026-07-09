"use client"

import { useMemo, useState } from "react"
import { LayoutGrid, List, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

import useVerificationSubTab from "../useVerificationSubTab"
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

const COLLAPSED_DOCUMENT_LIMIT = 10

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

const toEvidenceItemForDialog = (
  doc: EvidenceDocument,
  originalItems: EvidenceItem[],
): EvidenceItem | null => originalItems.find((item) => item.id === doc.id) ?? null

// ─── Panel ────────────────────────────────────────────────────────────────────

const EvidenceTabPanel = ({ evidence, isLoading, error }: EvidenceTabPanelProps) => {
  const { targetEvidenceId, clearTargetEvidence } = useVerificationSubTab()
  const [providerCategory, setProviderCategory] = useState<EvidenceProviderCategory>("all")
  const [activeSource, setActiveSource] = useState<EvidenceSource | "all">("all")
  const [viewMode, setViewMode] = useState<EvidenceViewMode>("grid")
  const [selectedDoc, setSelectedDoc] = useState<EvidenceDocument | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const documents = useMemo(
    () => evidence.map(toEvidenceDocument),
    [evidence],
  )

  const categoryFilteredDocuments = useMemo(
    () => filterByProviderCategory(documents, providerCategory),
    [documents, providerCategory],
  )

  const providerCategoryCounts = useMemo(
    () => deriveProviderCategoryCounts(documents),
    [documents],
  )

  const sourceFilters = useMemo(
    () => buildSourceFilters(categoryFilteredDocuments),
    [categoryFilteredDocuments],
  )

  const filteredDocuments = useMemo(
    () => filterDocuments(categoryFilteredDocuments, activeSource),
    [categoryFilteredDocuments, activeSource],
  )

  // The evidence a user navigated to from the skill drawer, derived from the URL.
  const targetDoc = useMemo(
    () =>
      targetEvidenceId
        ? documents.find((doc) => doc.evidenceId === targetEvidenceId) ?? null
        : null,
    [targetEvidenceId, documents],
  )

  const shouldShowFullList = isExpanded || targetDoc !== null

  const visibleDocuments = useMemo(
    () =>
      shouldShowFullList
        ? filteredDocuments
        : filteredDocuments.slice(0, COLLAPSED_DOCUMENT_LIMIT),
    [filteredDocuments, shouldShowFullList],
  )

  const hiddenDocumentCount = Math.max(
    filteredDocuments.length - COLLAPSED_DOCUMENT_LIMIT,
    0,
  )

  const stats = useMemo(() => deriveStats(documents), [documents])

  const handleProviderCategoryChange = (category: EvidenceProviderCategory) => {
    setProviderCategory(category)
    setActiveSource("all")
    setIsExpanded(false)
  }

  const handleSourceChange = (source: EvidenceSource | "all") => {
    setActiveSource(source)
    setIsExpanded(false)
  }

  // A user click takes precedence; otherwise fall back to the URL-driven target.
  const activeDoc = selectedDoc ?? targetDoc

  const selectedEvidenceItem = useMemo(
    () => (activeDoc ? toEvidenceItemForDialog(activeDoc, evidence) : null),
    [activeDoc, evidence],
  )

  const handleDocumentClick = (doc: EvidenceDocument) => setSelectedDoc(doc)
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedDoc(null)
      if (targetEvidenceId) clearTargetEvidence()
    }
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
      <EvidenceTabStatsBar
        total={stats.total}
        linked={stats.linked}
        unlinked={stats.unlinked}
        aiVerified={stats.aiVerified}
      />

      <EvidenceProviderFilter
        active={providerCategory}
        counts={providerCategoryCounts}
        onChange={handleProviderCategoryChange}
      />

      <div className="flex gap-6">
        <EvidenceSourceSidebar
          filters={sourceFilters}
          active={activeSource}
          onChange={handleSourceChange}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {filteredDocuments.length}{" "}
              {filteredDocuments.length === 1 ? "document" : "documents"}
            </p>
            <ViewModeToggle active={viewMode} onChange={setViewMode} />
          </div>

          <EvidenceDocumentGrid
            documents={visibleDocuments}
            viewMode={viewMode}
            onDocumentClick={handleDocumentClick}
          />

          {hiddenDocumentCount > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!shouldShowFullList)}
              className="mx-auto flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:cursor-pointer hover:border-primary/40 hover:text-foreground"
            >
              {shouldShowFullList ? (
                <>
                  Show less
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Read more
                  <span className="text-muted-foreground/70">
                    {hiddenDocumentCount} more
                  </span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <EvidenceDetailDialog
        evidence={selectedEvidenceItem}
        onOpenChange={handleDialogClose}
      />
    </div>
  )
}

export default EvidenceTabPanel
