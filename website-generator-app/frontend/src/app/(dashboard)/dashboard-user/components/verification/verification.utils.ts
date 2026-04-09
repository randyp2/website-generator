import type {
  EvidenceType,
  FilterOption,
  QualityFlag,
  SkillVerification,
  VerificationStatus,
  VerificationTier,
} from "./verification.types"

export const getTierColor = (tier: VerificationTier): string => {
  const map: Record<VerificationTier, string> = {
    Expert: "text-amber-400",
    Advanced: "text-amber-500",
    Intermediate: "text-yellow-500",
    Basic: "text-blue-400",
    Unverified: "text-zinc-500",
  }
  return map[tier]
}

export const getTierBgColor = (tier: VerificationTier): string => {
  const map: Record<VerificationTier, string> = {
    Expert: "bg-amber-400/20",
    Advanced: "bg-amber-500/20",
    Intermediate: "bg-yellow-500/20",
    Basic: "bg-blue-400/20",
    Unverified: "bg-zinc-500/20",
  }
  return map[tier]
}

export const getTierBarColor = (tier: VerificationTier): string => {
  const map: Record<VerificationTier, string> = {
    Expert: "bg-amber-400",
    Advanced: "bg-amber-500",
    Intermediate: "bg-yellow-500",
    Basic: "bg-blue-400",
    Unverified: "bg-zinc-500",
  }
  return map[tier]
}

export const getStatusColor = (
  status: VerificationStatus,
): string => {
  const map: Record<VerificationStatus, string> = {
    verified: "text-emerald-400",
    needs_action: "text-yellow-400",
    conflict: "text-red-400",
    pending: "text-zinc-400",
    expired: "text-zinc-500",
  }
  return map[status]
}

export const getStatusBgColor = (
  status: VerificationStatus,
): string => {
  const map: Record<VerificationStatus, string> = {
    verified: "bg-emerald-400/20",
    needs_action: "bg-yellow-400/20",
    conflict: "bg-red-400/20",
    pending: "bg-zinc-400/20",
    expired: "bg-zinc-500/20",
  }
  return map[status]
}

export const getConnectionStatusColor = (
  status: string,
): string => {
  const map: Record<string, string> = {
    connected: "bg-emerald-400/20 text-emerald-400",
    disconnected: "bg-zinc-500/20 text-zinc-400",
    expired: "bg-red-400/20 text-red-400",
    pending: "bg-yellow-400/20 text-yellow-400",
  }
  return map[status] ?? "bg-zinc-500/20 text-zinc-400"
}

export const getFreshnessLabel = (
  freshness: string,
): { label: string; color: string } => {
  const map: Record<string, { label: string; color: string }> = {
    fresh: { label: "Fresh", color: "text-emerald-400" },
    aging: { label: "Aging", color: "text-yellow-400" },
    stale: { label: "Stale", color: "text-red-400" },
  }
  return map[freshness] ?? { label: "Unknown", color: "text-zinc-400" }
}

export const getQualityBadgeVariant = (
  quality: QualityFlag,
): "default" | "secondary" | "destructive" | "outline" => {
  const map: Record<QualityFlag, "default" | "secondary" | "destructive" | "outline"> = {
    high: "default",
    medium: "secondary",
    low: "outline",
    conflicting: "destructive",
  }
  return map[quality]
}

export const filterSkills = (
  skills: SkillVerification[],
  filter: FilterOption,
): SkillVerification[] => {
  if (filter === "all") return skills
  if (filter === "verified") return skills.filter((s) => s.status === "verified")
  if (filter === "needs_action")
    return skills.filter((s) => s.status === "needs_action")
  if (filter === "conflicts") return skills.filter((s) => s.status === "conflict")
  return skills
}

export const EVIDENCE_TYPE_COLORS: Record<EvidenceType, string> = {
  endorsement: "bg-blue-500",
  certification: "bg-emerald-500",
  project: "bg-amber-500",
  assessment: "bg-purple-500",
  self_reported: "bg-zinc-500",
}

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  endorsement: "Endorsement",
  certification: "Certification",
  project: "Project",
  assessment: "Assessment",
  self_reported: "Self-reported",
}

export const getEvidenceMixForSkill = (
  skill: SkillVerification,
): { type: EvidenceType; count: number; percentage: number }[] => {
  const items: { type: EvidenceType; count: number }[] = [
    { type: "endorsement", count: skill.endorsementCount },
    { type: "certification", count: skill.certificationCount },
    { type: "project", count: skill.projectCount },
    { type: "assessment", count: skill.assessmentCount },
    { type: "self_reported", count: skill.selfReportedCount },
  ]
  const total = items.reduce((sum, i) => sum + i.count, 0)
  if (total === 0) return items.map((i) => ({ ...i, percentage: 0 }))
  return items.map((i) => ({
    ...i,
    percentage: Math.round((i.count / total) * 100),
  }))
}

const TIER_THRESHOLDS: Record<VerificationTier, number> = {
  Unverified: 0,
  Basic: 21,
  Intermediate: 41,
  Advanced: 61,
  Expert: 81,
}

const TIER_ORDER: VerificationTier[] = [
  "Unverified",
  "Basic",
  "Intermediate",
  "Advanced",
  "Expert",
]

export const calculateGapToNextTier = (
  score: number,
  tier: VerificationTier,
): { nextTier: VerificationTier; gap: number } | null => {
  const currentIndex = TIER_ORDER.indexOf(tier)
  if (currentIndex >= TIER_ORDER.length - 1) return null
  const nextTier = TIER_ORDER[currentIndex + 1]
  const threshold = TIER_THRESHOLDS[nextTier]
  return { nextTier, gap: threshold - score }
}
