"use client"

import {
  FileText,
  Image,
  Github,
  Award,
  FileCode2,
  File,
  Link2,
  Unlink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { EvidenceDocumentCardProps } from "./evidence-tab.types"
import type { EvidenceFileType } from "./evidence-tab.types"
import {
  FILE_TYPE_CONFIG,
  QUALITY_CONFIDENCE_CLASS,
  formatConfidencePercent,
  formatEvidenceDate,
  formatLinkTypeLabel,
} from "./evidence-tab.utils"

// ─── File icon map ────────────────────────────────────────────────────────────

const FILE_TYPE_ICONS: Record<EvidenceFileType, React.ElementType> = {
  pdf:         FileText,
  image:       Image,
  repository:  Github,
  certificate: Award,
  document:    FileCode2,
  other:       File,
}

// ─── Status indicator ─────────────────────────────────────────────────────────

const StatusDot = ({ status }: { status: string }) => {
  const colorClass =
    status === "linked"    ? "bg-emerald-400" :
    status === "processed" ? "bg-blue-400"    :
    status === "failed"    ? "bg-rose-500"    :
    status === "unlinked"  ? "bg-amber-400"   :
                             "bg-zinc-400"

  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", colorClass)} />
}

// ─── Card ─────────────────────────────────────────────────────────────────────

const EvidenceDocumentCard = ({ doc, onClick }: EvidenceDocumentCardProps) => {
  const { bgClass } = FILE_TYPE_CONFIG[doc.fileType]
  const FileIcon = FILE_TYPE_ICONS[doc.fileType]
  const isLinked = doc.linkedSkillName !== null

  return (
    <button
      onClick={() => onClick(doc)}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:cursor-pointer hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Document icon area — mimics DocHub's thumbnail zone */}
      <div
        className={cn(
          "flex h-28 w-full items-center justify-center border-b border-border",
          bgClass,
        )}
      >
        <FileIcon className="h-10 w-10 opacity-80" />
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Title */}
        <p
          className="line-clamp-2 text-xs font-semibold leading-snug text-foreground"
          title={doc.title}
        >
          {doc.title}
        </p>

        {/* Linked skill or unlinked indicator */}
        {isLinked ? (
          <div className="flex items-center gap-1">
            <Link2 className="h-3 w-3 shrink-0 text-emerald-500" />
            <span className="truncate text-[11px] text-emerald-600 dark:text-emerald-400">
              {doc.linkedSkillName}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Unlink className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Not linked</span>
          </div>
        )}

        {/* Match type badge */}
        {doc.linkType && (
          <Badge variant="outline" className="w-fit text-[10px]">
            {formatLinkTypeLabel(doc.linkType)}
          </Badge>
        )}
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <div className="flex items-center gap-1.5">
          <StatusDot status={doc.status} />
          <span className="text-[10px] capitalize text-muted-foreground">
            {doc.status}
          </span>
        </div>
        {doc.linkConfidence !== null && (
          <span
            className={cn(
              "text-[11px] font-semibold",
              QUALITY_CONFIDENCE_CLASS[doc.quality],
            )}
          >
            {formatConfidencePercent(doc.linkConfidence)}
          </span>
        )}
        {doc.linkConfidence === null && (
          <span className="text-[10px] text-muted-foreground">
            {formatEvidenceDate(doc.date)}
          </span>
        )}
      </div>
    </button>
  )
}

export default EvidenceDocumentCard
