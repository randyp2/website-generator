import type { ClaimDTO } from "@/types/claim"
import type {
  VerificationClaimScoreDTO,
  VerificationSuggestedActionDTO,
  VerificationSummaryDTO,
} from "@/types/verification-summary"

import type {
  EvidenceType,
  FilterOption,
  QualityFlag,
  SkillVerification,
  VerificationOverviewData,
  VerificationStatus,
  VerificationTier,
} from "./verification.types"

export const mapBackendEvidenceTypeToUiType = (
  evidenceType: string | null | undefined,
): EvidenceType => {
  const normalized = (evidenceType ?? "").trim().toLowerCase()
  if (
    normalized === "repository" ||
    normalized === "repo" ||
    normalized === "project"
  ) {
    return "project"
  }
  if (normalized === "certification") {
    return "certification"
  }
  if (normalized === "endorsement") {
    return "endorsement"
  }
  if (normalized === "assessment") {
    return "assessment"
  }
  return "self_reported"
}

const TIER_STYLE_MAP: Record<VerificationTier, {
  text: string
  bg: string
  bar: string
  ring: string
}> = {
  Unverified: {
    text: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-500/20",
    bar: "bg-zinc-500",
    ring: "text-zinc-500",
  },
  Basic: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-500/20",
    bar: "bg-amber-400",
    ring: "text-amber-400",
  },
  Intermediate: {
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/20",
    bar: "bg-orange-400",
    ring: "text-orange-400",
  },
  Advanced: {
    text: "text-orange-700 dark:text-orange-500",
    bg: "bg-orange-600/20",
    bar: "bg-orange-600",
    ring: "text-orange-500",
  },
  Expert: {
    text: "text-rose-700 dark:text-rose-500",
    bg: "bg-rose-500/20",
    bar: "bg-rose-500",
    ring: "text-rose-500",
  },
}

export const getTierColor = (tier: VerificationTier): string =>
  TIER_STYLE_MAP[tier].text

export const getTierBgColor = (tier: VerificationTier): string =>
  TIER_STYLE_MAP[tier].bg

export const getTierBarColor = (tier: VerificationTier): string =>
  TIER_STYLE_MAP[tier].bar

export const getTierRingColor = (tier: VerificationTier): string =>
  TIER_STYLE_MAP[tier].ring

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

// ─── Claim → SkillVerification mappers ──────────────────────────────

const mapClaimStatus = (status: string): VerificationStatus => {
  switch (status) {
    case "verified":
      return "verified"
    case "pending":
      return "pending"
    case "conflict":
      return "conflict"
    case "expired":
      return "expired"
    default:
      return "needs_action"
  }
}

const scoreFromConfidence = (confidence: number | null): number => {
  if (confidence === null) return 0
  return Math.round(confidence * 100)
}

const formatDelta = (delta: number): string => {
  if (delta > 0) {
    return `+${delta}`
  }
  return `${delta}`
}

const tierFromScore = (score: number): VerificationTier => {
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    if (score >= TIER_THRESHOLDS[TIER_ORDER[i]]) return TIER_ORDER[i]
  }
  return "Unverified"
}

const freshnessFromDate = (
  dateStr: string,
): "fresh" | "aging" | "stale" => {
  const age = Date.now() - new Date(dateStr).getTime()
  const days = age / (1000 * 60 * 60 * 24)
  if (days <= 30) return "fresh"
  if (days <= 90) return "aging"
  return "stale"
}

export const mapClaimsToSkillVerifications = (
  claims: ClaimDTO[],
): SkillVerification[] =>
  claims.map((claim) => {
    const score = scoreFromConfidence(claim.confidence)
    const tier = tierFromScore(score)
    const status = mapClaimStatus(claim.status)
    const freshness = freshnessFromDate(claim.updatedAt)
    const linkedEvidence = claim.evidenceSummary?.linkedEvidence ?? []
    const typeCounts: Record<EvidenceType, number> = {
      endorsement: 0,
      certification: 0,
      project: 0,
      assessment: 0,
      self_reported: 0,
    }
    linkedEvidence.forEach((item) => {
      const type = mapBackendEvidenceTypeToUiType(item.evidenceType)
      typeCounts[type] += 1
    })

    return {
      id: claim.id,
      name: claim.canonicalSkillName ?? claim.rawValue,
      baselineScore: score,
      evidenceContribution: 0,
      evidenceLinksUsed: claim.evidenceSummary?.linkedEvidenceCount ?? 0,
      scoreReasonCode: "legacy_claim_confidence_only",
      scoreReasonText:
        "Score is based on extracted claim confidence only for this view.",
      score,
      tier,
      status,
      freshness,
      lastVerified: claim.updatedAt,
      evidenceCount: claim.evidenceSummary?.linkedEvidenceCount ?? 0,
      endorsementCount: typeCounts.endorsement,
      certificationCount: typeCounts.certification,
      projectCount: typeCounts.project,
      assessmentCount: typeCounts.assessment,
      selfReportedCount: typeCounts.self_reported,
      conflictDetails: null,
      suggestedActions: [],
    }
  })

export const mapSummaryClaimsToSkillVerifications = (
  claims: VerificationClaimScoreDTO[],
  suggestedActions: VerificationSuggestedActionDTO[],
  generatedAt: string,
  claimById?: Map<string, ClaimDTO>,
): SkillVerification[] =>
  claims.map((claim) => {
    const score = claim.claimScore
    const baselineScore = claim.baselineClaimScore
    const evidenceContribution = claim.evidenceContribution
    const tier = tierFromScore(score)
    const status = mapClaimStatus(claim.status)
    const claimEvidence = claimById?.get(claim.id)?.evidenceSummary
    const linkedEvidence = claimEvidence?.linkedEvidence ?? []
    const typeCounts: Record<EvidenceType, number> = {
      endorsement: 0,
      certification: 0,
      project: 0,
      assessment: 0,
      self_reported: 0,
    }
    linkedEvidence.forEach((item) => {
      const type = mapBackendEvidenceTypeToUiType(item.evidenceType)
      typeCounts[type] += 1
    })
    const linkedEvidenceCount = claimEvidence?.linkedEvidenceCount ?? 0
    const evidenceLinksUsed = claim.evidenceLinksUsed > 0
      ? claim.evidenceLinksUsed
      : linkedEvidenceCount
    const actions = suggestedActions
      .filter((action) => action.claimId === claim.id)
      .sort((a, b) => b.priority - a.priority)
      .map((action) => ({
        action: action.action,
        reason: action.reason,
        priority: action.priority,
      }))

    return {
      id: claim.id,
      name: claim.canonicalSkillName ?? claim.rawValue,
      baselineScore,
      evidenceContribution,
      evidenceLinksUsed,
      scoreReasonCode: claim.scoreReasonCode || "reason_unavailable",
      scoreReasonText:
        claim.scoreReasonText ||
        "Detailed score reason is not available for this claim yet.",
      score,
      tier,
      status,
      freshness: "fresh",
      lastVerified: generatedAt,
      evidenceCount: evidenceLinksUsed,
      endorsementCount: typeCounts.endorsement,
      certificationCount: typeCounts.certification,
      projectCount: typeCounts.project,
      assessmentCount: typeCounts.assessment,
      selfReportedCount: typeCounts.self_reported,
      conflictDetails: null,
      suggestedActions: actions,
    }
  })

export const deriveOverview = (
  skills: SkillVerification[],
): VerificationOverviewData => {
  const total = skills.length
  const unmatchedSkills = skills.filter(
    (s) => s.status === "needs_action",
  ).length
  const matchedSkills = Math.max(0, total - unmatchedSkills)
  const unverifiedClaimsCount = skills.filter((s) => s.status !== "verified").length

  const avgScore =
    total > 0
      ? Math.round(skills.reduce((sum, s) => sum + s.score, 0) / total)
      : 0

  return {
    baselineOverallScore: avgScore,
    evidenceDelta: 0,
    overallScore: avgScore,
    tier: tierFromScore(avgScore),
    totalSkills: total,
    matchedSkills,
    unmatchedSkills,
    unverifiedClaimsCount,
    lastRunDate: new Date().toISOString(),
    trustNote:
      "Initial deterministic score based on canonical matching and claim source.",
  }
}

export const deriveOverviewFromSummary = (
  summary: VerificationSummaryDTO,
): VerificationOverviewData => ({
  baselineOverallScore: summary.baselineOverallScore,
  evidenceDelta: summary.evidenceDelta,
  overallScore: summary.overallScore,
  tier: tierFromScore(summary.overallScore),
  totalSkills: summary.totalSkills,
  matchedSkills: summary.matchedSkills,
  unmatchedSkills: summary.unmatchedSkills,
  unverifiedClaimsCount: summary.claims.filter((c) => c.evidenceLinksUsed === 0).length,
  lastRunDate: summary.generatedAt,
  trustNote:
    summary.profileScoreNarrative ??
    (summary.evidenceDelta === 0
      ? `Baseline ${summary.baselineOverallScore} with no evidence adjustment.`
      : `Baseline ${summary.baselineOverallScore}, evidence delta ${formatDelta(summary.evidenceDelta)}, final ${summary.overallScore}.`),
})
