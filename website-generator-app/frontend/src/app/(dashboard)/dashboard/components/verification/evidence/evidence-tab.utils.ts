import type { EvidenceItem, QualityFlag } from "../verification.types"
import type {
  EvidenceDocument,
  EvidenceDocumentStatus,
  EvidenceFileType,
  EvidenceProviderCategory,
  EvidenceSource,
  EvidenceSourceFilter,
} from "./evidence-tab.types"

// ─── Source helpers ───────────────────────────────────────────────────────────

const SOURCE_LABEL_MAP: Record<EvidenceSource, string> = {
  manual_upload: "AI Upload",
  github: "GitHub",
  linkedin: "LinkedIn",
  other: "Other",
}

export const normalizeSource = (raw: string | null | undefined): EvidenceSource => {
  const v = (raw ?? "").trim().toLowerCase()
  if (v === "manual_upload") return "manual_upload"
  if (v === "github") return "github"
  if (v === "linkedin") return "linkedin"
  return "other"
}

export const formatSourceLabel = (source: EvidenceSource): string =>
  SOURCE_LABEL_MAP[source]

// ─── File type resolution ─────────────────────────────────────────────────────

/**
 * Resolves the display file type from a document's title and source.
 * Used to pick the icon and accent color on each card.
 */
export const resolveFileType = (
  title: string | null | undefined,
  source: EvidenceSource,
): EvidenceFileType => {
  if (source === "github") return "repository"

  const ext = (title ?? "").split(".").pop()?.toLowerCase() ?? ""
  if (ext === "pdf") return "pdf"
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image"
  if (["doc", "docx", "txt", "md"].includes(ext)) return "document"
  if (["crt", "cer", "pem"].includes(ext)) return "certificate"

  const lower = (title ?? "").toLowerCase()
  if (lower.includes("certif")) return "certificate"
  if (lower.includes("resume") || lower.includes("cv")) return "pdf"

  return "other"
}

// ─── Status resolution ────────────────────────────────────────────────────────

const resolveDocumentStatus = (
  item: EvidenceItem,
): EvidenceDocumentStatus => {
  if (item.skillId === "unlinked") return "unlinked"
  if (item.linkConfidence !== null) return "linked"
  return "processed"
}

// ─── EvidenceItem → EvidenceDocument ─────────────────────────────────────────

export const toEvidenceDocument = (item: EvidenceItem): EvidenceDocument => {
  const source = normalizeSource(item.source)
  return {
    id: item.id,
    evidenceId: item.evidenceId,
    title: item.title ?? item.description ?? item.externalId ?? "Untitled",
    fileType: resolveFileType(item.title, source),
    source,
    status: resolveDocumentStatus(item),
    linkedSkillName: item.skillId === "unlinked" ? null : item.skillName,
    linkedSkillId: item.skillId === "unlinked" ? null : item.skillId,
    linkType: item.linkType,
    linkConfidence: item.linkConfidence,
    quality: item.quality,
    date: item.date,
    url: item.url,
    metadata: item.metadata,
  }
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

export const buildSourceFilters = (
  docs: EvidenceDocument[],
): EvidenceSourceFilter[] => {
  const counts: Record<EvidenceSource, number> = {
    manual_upload: 0,
    github: 0,
    linkedin: 0,
    other: 0,
  }
  for (const doc of docs) {
    counts[doc.source] += 1
  }

  const filters: EvidenceSourceFilter[] = [
    { value: "all", label: "All", count: docs.length },
  ]

  const sourceOrder: EvidenceSource[] = ["manual_upload", "github", "linkedin", "other"]
  for (const source of sourceOrder) {
    if (counts[source] > 0) {
      filters.push({
        value: source,
        label: formatSourceLabel(source),
        count: counts[source],
      })
    }
  }

  return filters
}

export const filterDocuments = (
  docs: EvidenceDocument[],
  source: EvidenceSource | "all",
): EvidenceDocument[] => {
  if (source === "all") return docs
  return docs.filter((doc) => doc.source === source)
}

// ─── Provider category helpers ────────────────────────────────────────────────

/** Sources that require the user to connect an external account via OAuth. */
const AUTH_PROVIDER_SOURCES = new Set<EvidenceSource>(["github", "linkedin"])

export const isAuthProvider = (source: EvidenceSource): boolean =>
  AUTH_PROVIDER_SOURCES.has(source)

export const filterByProviderCategory = (
  docs: EvidenceDocument[],
  category: EvidenceProviderCategory,
): EvidenceDocument[] => {
  if (category === "all") return docs
  if (category === "auth_provider") return docs.filter((d) => isAuthProvider(d.source))
  return docs.filter((d) => !isAuthProvider(d.source))
}

export const deriveProviderCategoryCounts = (
  docs: EvidenceDocument[],
): Record<EvidenceProviderCategory, number> => ({
  all: docs.length,
  auth_provider: docs.filter((d) => isAuthProvider(d.source)).length,
  upload: docs.filter((d) => !isAuthProvider(d.source)).length,
})

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface EvidenceStats {
  total: number
  linked: number
  unlinked: number
  aiVerified: number
}

export const deriveStats = (docs: EvidenceDocument[]): EvidenceStats => ({
  total: docs.length,
  linked: docs.filter((d) => d.status === "linked").length,
  unlinked: docs.filter((d) => d.status === "unlinked").length,
  aiVerified: docs.filter(
    (d) => d.source === "manual_upload" && d.linkConfidence !== null && d.linkConfidence >= 0.85,
  ).length,
})

// ─── Display formatters ───────────────────────────────────────────────────────

export const formatConfidencePercent = (confidence: number | null): string => {
  if (confidence === null) return "—"
  return `${Math.round(confidence * 100)}%`
}

export const formatEvidenceDate = (value: string | null | undefined): string => {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const formatLinkTypeLabel = (linkType: string | null): string => {
  if (!linkType) return "Unlinked"
  return linkType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

// ─── Quality colors (reused from verification.utils but scoped here) ──────────

export const QUALITY_CONFIDENCE_CLASS: Record<QualityFlag, string> = {
  high: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-rose-500 dark:text-rose-400",
  conflicting: "text-destructive",
}

// ─── File type visual config ──────────────────────────────────────────────────

export interface FileTypeConfig {
  bgClass: string
  label: string
}

export const FILE_TYPE_CONFIG: Record<EvidenceFileType, FileTypeConfig> = {
  pdf:        { bgClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400",       label: "PDF"   },
  image:      { bgClass: "bg-violet-500/15 text-violet-600 dark:text-violet-400", label: "Image" },
  repository: { bgClass: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",       label: "Repo"  },
  certificate:{ bgClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",    label: "Cert"  },
  document:   { bgClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400",       label: "Doc"   },
  other:      { bgClass: "bg-muted text-muted-foreground",                         label: "File"  },
}
