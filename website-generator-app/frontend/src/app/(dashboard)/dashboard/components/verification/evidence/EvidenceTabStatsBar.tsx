"use client"

import { Sparkles, Link2, Unlink, FileStack } from "lucide-react"
import type { EvidenceTabStatsBarProps } from "./evidence-tab.types"

interface StatChipProps {
  icon: React.ReactNode
  label: string
  value: number
  accent?: string
}

const StatChip = ({ icon, label, value, accent = "text-foreground" }: StatChipProps) => (
  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5">
    <span className={`shrink-0 ${accent}`}>{icon}</span>
    <div>
      <p className={`text-base font-semibold leading-none ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  </div>
)

const EvidenceTabStatsBar = ({
  total,
  linked,
  unlinked,
  aiVerified,
}: EvidenceTabStatsBarProps) => (
  <div className="flex flex-wrap gap-3">
    <StatChip
      icon={<FileStack className="h-4 w-4" />}
      label="Total evidence"
      value={total}
    />
    <StatChip
      icon={<Link2 className="h-4 w-4" />}
      label="Linked to skills"
      value={linked}
      accent="text-emerald-600 dark:text-emerald-400"
    />
    <StatChip
      icon={<Unlink className="h-4 w-4" />}
      label="Unlinked"
      value={unlinked}
      accent={unlinked > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}
    />
    <StatChip
      icon={<Sparkles className="h-4 w-4" />}
      label="AI verified"
      value={aiVerified}
      accent="text-violet-600 dark:text-violet-400"
    />
  </div>
)

export default EvidenceTabStatsBar
