import type { QualityFlag } from "../verification.types"

// ─── Source ──────────────────────────────────────────────────────────────────

/** Normalized provider source for an evidence document. */
export type EvidenceSource =
  | "manual_upload"
  | "github"
  | "linkedin"
  | "other"

// ─── Document status ─────────────────────────────────────────────────────────

/**
 * Display status of a single evidence document.
 *
 * - processed: AI has analyzed it and produced a link or a confident no-match
 * - processing: upload exists but the AI job hasn't finished yet
 * - failed: the AI job errored out
 * - linked: evidence is connected to at least one skill claim
 * - unlinked: evidence exists but isn't connected to any skill
 */
export type EvidenceDocumentStatus =
  | "processed"
  | "processing"
  | "failed"
  | "linked"
  | "unlinked"

// ─── File type ───────────────────────────────────────────────────────────────

/** Visual file-type classification used to pick the icon and color. */
export type EvidenceFileType =
  | "pdf"
  | "image"
  | "repository"
  | "certificate"
  | "document"
  | "other"

// ─── Provider category ────────────────────────────────────────────────────────

/**
 * High-level origin of an evidence document.
 *
 * - auth_provider: came from a connected account (GitHub, LinkedIn, etc.)
 * - upload: came from a user-submitted file analyzed by AI
 */
export type EvidenceProviderCategory = "all" | "auth_provider" | "upload"

// ─── View mode ───────────────────────────────────────────────────────────────

export type EvidenceViewMode = "grid" | "list"

// ─── Core display model ──────────────────────────────────────────────────────

/**
 * A single evidence document as shown in the Evidence tab.
 * Derived from EvidenceItem by the utils layer — never fetched directly.
 */
export interface EvidenceDocument {
  /** Composite key: evidenceId or evidenceId:claimId for linked items */
  id: string
  evidenceId: string
  title: string
  fileType: EvidenceFileType
  source: EvidenceSource
  status: EvidenceDocumentStatus
  /** The skill this document is linked to, if any */
  linkedSkillName: string | null
  linkedSkillId: string | null
  linkType: string | null
  linkConfidence: number | null
  evidenceDepth: number | null
  quality: QualityFlag
  /** Primary display date — occurred > captured > created */
  date: string
  url: string | null
  metadata: Record<string, unknown> | null
}

// ─── Source filter ────────────────────────────────────────────────────────────

export interface EvidenceSourceFilter {
  value: EvidenceSource | "all"
  label: string
  count: number
}

// ─── Component props ─────────────────────────────────────────────────────────

export interface EvidenceTabPanelProps {
  /** Flat evidence items already shaped by VerificationTab */
  evidence: import("../verification.types").EvidenceItem[]
  isLoading: boolean
  error: string | null
}

export interface EvidenceSourceSidebarProps {
  filters: EvidenceSourceFilter[]
  active: EvidenceSource | "all"
  onChange: (source: EvidenceSource | "all") => void
}

export interface EvidenceProviderFilterProps {
  active: EvidenceProviderCategory
  counts: Record<EvidenceProviderCategory, number>
  onChange: (category: EvidenceProviderCategory) => void
}

export interface EvidenceDocumentCardProps {
  doc: EvidenceDocument
  onClick: (doc: EvidenceDocument) => void
}

export interface EvidenceDocumentGridProps {
  documents: EvidenceDocument[]
  viewMode: EvidenceViewMode
  onDocumentClick: (doc: EvidenceDocument) => void
}

export interface EvidenceTabStatsBarProps {
  total: number
  linked: number
  unlinked: number
  aiVerified: number
}
