"use client"

import { useMemo, useState } from "react"
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react"
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

const ITEMS_PER_PAGE = 10

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

// ─── Pagination controls ──────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

const Pagination = ({ currentPage, totalPages, onPrev, onNext }: PaginationProps) => (
  <div className="flex items-center justify-center gap-3 pt-2">
    <button
      onClick={onPrev}
      disabled={currentPage === 1}
      className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      <ChevronLeft className="h-3.5 w-3.5" />
      Prev
    </button>
    <span className="text-xs text-muted-foreground">
      {currentPage} / {totalPages}
    </span>
    <button
      onClick={onNext}
      disabled={currentPage === totalPages}
      className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      Next
      <ChevronRight className="h-3.5 w-3.5" />
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
  const [providerCategory, setProviderCategory] = useState<EvidenceProviderCategory>("all")
  const [activeSource, setActiveSource] = useState<EvidenceSource | "all">("all")
  const [viewMode, setViewMode] = useState<EvidenceViewMode>("grid")
  const [selectedDoc, setSelectedDoc] = useState<EvidenceDocument | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE))

  const pagedDocuments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredDocuments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredDocuments, currentPage])

  const stats = useMemo(() => deriveStats(documents), [documents])

  const handleProviderCategoryChange = (category: EvidenceProviderCategory) => {
    setProviderCategory(category)
    setActiveSource("all")
    setCurrentPage(1)
  }

  const handleSourceChange = (source: EvidenceSource | "all") => {
    setActiveSource(source)
    setCurrentPage(1)
  }

  const selectedEvidenceItem = useMemo(
    () => (selectedDoc ? toEvidenceItemForDialog(selectedDoc, evidence) : null),
    [selectedDoc, evidence],
  )

  const handleDocumentClick = (doc: EvidenceDocument) => setSelectedDoc(doc)
  const handleDialogClose = (open: boolean) => { if (!open) setSelectedDoc(null) }

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
            documents={pagedDocuments}
            viewMode={viewMode}
            onDocumentClick={handleDocumentClick}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={() => setCurrentPage((p) => p - 1)}
              onNext={() => setCurrentPage((p) => p + 1)}
            />
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
