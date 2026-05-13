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
import type { EvidenceDocumentGridProps } from "./evidence-tab.types"
import type { EvidenceFileType } from "./evidence-tab.types"
import EvidenceDocumentCard from "./EvidenceDocumentCard"
import {
  formatEvidenceDate,
  formatLinkTypeLabel,
  QUALITY_CONFIDENCE_CLASS,
  formatConfidencePercent,
  FILE_TYPE_CONFIG,
} from "./evidence-tab.utils"

// ─── List row (used when viewMode === "list") ─────────────────────────────────

const FILE_TYPE_ICONS: Record<EvidenceFileType, React.ElementType> = {
  pdf:         FileText,
  image:       Image,
  repository:  Github,
  certificate: Award,
  document:    FileCode2,
  other:       File,
}

const EvidenceDocumentGrid = ({
  documents,
  viewMode,
  onDocumentClick,
}: EvidenceDocumentGridProps) => {
  if (documents.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No documents match the selected source.
      </p>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Document</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Source</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Linked skill</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Match type</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Confidence</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const { bgClass } = FILE_TYPE_CONFIG[doc.fileType]
              const FileIcon = FILE_TYPE_ICONS[doc.fileType]
              return (
                <tr
                  key={doc.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 hover:cursor-pointer"
                  onClick={() => onDocumentClick(doc)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onDocumentClick(doc)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  {/* Document name + icon */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", bgClass)}>
                        <FileIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="max-w-48 truncate text-xs font-medium text-foreground">
                        {doc.title}
                      </span>
                    </div>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {doc.source.replace("_", " ")}
                    </Badge>
                  </td>

                  {/* Linked skill */}
                  <td className="px-4 py-3">
                    {doc.linkedSkillName ? (
                      <div className="flex items-center gap-1">
                        <Link2 className="h-3 w-3 shrink-0 text-emerald-500" />
                        <span className="truncate text-xs text-emerald-600 dark:text-emerald-400">
                          {doc.linkedSkillName}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Unlink className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">None</span>
                      </div>
                    )}
                  </td>

                  {/* Match type */}
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {formatLinkTypeLabel(doc.linkType)}
                  </td>

                  {/* Confidence */}
                  <td className={cn("px-4 py-3 text-xs font-semibold", QUALITY_CONFIDENCE_CLASS[doc.quality])}>
                    {formatConfidencePercent(doc.linkConfidence)}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                    {formatEvidenceDate(doc.date)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {documents.map((doc) => (
        <EvidenceDocumentCard
          key={doc.id}
          doc={doc}
          onClick={onDocumentClick}
        />
      ))}
    </div>
  )
}

export default EvidenceDocumentGrid
