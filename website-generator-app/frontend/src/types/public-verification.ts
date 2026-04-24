export interface PublicVerificationClaimScoreDTO {
  id: string
  rawValue: string
  canonicalSkillId: string | null
  canonicalSkillName: string | null
  source: string
  status: string
  state: string
  baselineClaimScore: number
  evidenceContribution: number
  evidenceLinksUsed: number
  claimScore: number
  scoreReasonCode: string
  scoreReasonText: string
  canonicalCategory: string | null
  canonicalWeight: number | null
}

export interface PublicVerificationSuggestedActionDTO {
  claimId: string
  action: string
  reason: string
  priority: number
}

export interface PublicVerificationSummaryDTO {
  scoreType: string
  baselineOverallScore: number
  evidenceDelta: number
  overallScore: number
  totalSkills: number
  matchedSkills: number
  unmatchedSkills: number
  normalizedCoverage: number
  sourceQuality: number
  parserConfidence: number | null
  profileScoreNarrative: string | null
  claims: PublicVerificationClaimScoreDTO[]
  unverifiedClaims: PublicVerificationClaimScoreDTO[]
  suggestedActions: PublicVerificationSuggestedActionDTO[]
  generatedAt: string
}

export interface PublicClaimLinkedEvidenceDTO {
  evidenceId: string
  provider: string
  externalId: string
  evidenceType: string
  title: string | null
  sourceUrl: string | null
  capturedAt: string | null
  linkType: string
  linkConfidence: number | null
  reason: string | null
}

export interface PublicClaimEvidenceSummaryDTO {
  claimId: string
  linkedEvidenceCount: number
  linkedEvidence: PublicClaimLinkedEvidenceDTO[]
}

export interface PublicClaimDTO {
  id: string
  claimType: string
  rawValue: string
  canonicalSkillId: string | null
  canonicalSkillName: string | null
  source: string
  confidence: number | null
  status: string
  evidenceSummary: PublicClaimEvidenceSummaryDTO
  createdAt: string
  updatedAt: string
}

export interface PublicConnectedAccountDTO {
  provider: string
  status: string
  connectedAt: string | null
  lastSyncedAt: string | null
  lastSyncStatus: string
  lastSyncCompletedAt: string | null
  lastSyncImportedCount: number
  lastSyncLinkedCount: number
}

export interface PublicEvidenceLinkDTO {
  claimId: string
  linkType: string
  linkConfidence: number | null
  reason: string | null
}

export interface PublicEvidenceDTO {
  id: string
  provider: string
  externalId: string
  evidenceType: string
  title: string | null
  description: string | null
  sourceUrl: string | null
  occurredAt: string | null
  capturedAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string | null
  updatedAt: string | null
  links: PublicEvidenceLinkDTO[]
}

export interface PublicEvidenceListResponseDTO {
  items: PublicEvidenceDTO[]
  nextCursor: string | null
}
