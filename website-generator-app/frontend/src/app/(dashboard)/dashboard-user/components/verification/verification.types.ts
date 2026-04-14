export type VerificationTier =
  | "Unverified"
  | "Basic"
  | "Intermediate"
  | "Advanced"
  | "Expert"

export type VerificationStatus =
  | "verified"
  | "needs_action"
  | "conflict"
  | "pending"
  | "expired"

export type ConnectionProvider = "linkedin" | "github" | "website" | "other"

export type ConnectionStatus =
  | "connected"
  | "disconnected"
  | "expired"
  | "pending"

export type EvidenceType =
  | "endorsement"
  | "certification"
  | "project"
  | "assessment"
  | "self_reported"

export type QualityFlag = "high" | "medium" | "low" | "conflicting"

export type FilterOption = "all" | "verified" | "needs_action" | "conflicts"

export type ViewState = "empty" | "partial" | "loaded" | "loading" | "error"

export interface VerificationOverviewData {
  overallScore: number
  tier: VerificationTier
  totalSkills: number
  matchedSkills: number
  unmatchedSkills: number
  unverifiedClaimsCount: number
  lastRunDate: string
  trustNote: string
}

export interface ConnectionData {
  provider: ConnectionProvider
  displayName: string
  status: ConnectionStatus
  connectedAt: string | null
  profileUrl: string | null
  endorsementCount: number
  potentialPoints: number
  permissionScope: string
}

export interface ConflictDetail {
  source: string
  claim: string
  counterSource: string
  counterClaim: string
}

export interface SkillVerification {
  id: string
  name: string
  score: number
  tier: VerificationTier
  status: VerificationStatus
  freshness: "fresh" | "aging" | "stale"
  lastVerified: string
  evidenceCount: number
  endorsementCount: number
  certificationCount: number
  projectCount: number
  assessmentCount: number
  selfReportedCount: number
  conflictDetails: ConflictDetail[] | null
  suggestedActions?: {
    action: string
    reason: string
    priority: number
  }[]
}

export interface EvidenceItem {
  id: string
  skillId: string
  skillName: string
  type: EvidenceType
  source: string
  description: string
  date: string
  quality: QualityFlag
  url: string | null
}

export interface HistoryEntry {
  id: string
  date: string
  type: "full_run" | "partial_run" | "manual_update"
  summary: string
  scoreChange: number
  skillsAffected: number
}

export interface VerificationTabProps {
  userId: string
}

export interface ResumeFile {
  name: string
  size: string
  url: string
  file: File
}

export interface VerificationOverviewProps {
  data: VerificationOverviewData
  onRerunChecks: () => void
}

export interface ConnectionsPanelProps {
  connections: ConnectionData[]
  onConnect: (provider: ConnectionProvider) => void
  onDisconnect: (provider: ConnectionProvider) => void
}

export interface SkillLeaderboardProps {
  skills: SkillVerification[]
  onSkillClick: (skillId: string) => void
}

export interface SkillChartsProps {
  skills: SkillVerification[]
}

export interface SkillDetailDrawerProps {
  skill: SkillVerification | null
  evidence: EvidenceItem[]
  open: boolean
  isDeletingClaim: boolean
  deleteError: string | null
  onDeleteClaim: (claimId: string) => Promise<void>
  onClose: () => void
}

export interface EvidenceTableProps {
  evidence: EvidenceItem[]
  activeTypeFilter: EvidenceType | "all"
  onTypeFilterChange: (type: EvidenceType | "all") => void
}

export interface VerificationHistoryProps {
  entries: HistoryEntry[]
}

export interface VerificationFilterBarProps {
  active: FilterOption
  counts: Record<FilterOption, number>
  onChange: (filter: FilterOption) => void
}

export interface VerificationEmptyStateProps {
  onStart: () => void
}

export interface VerificationErrorStateProps {
  onRetry: () => void
}
