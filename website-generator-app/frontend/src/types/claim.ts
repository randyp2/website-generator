export interface ClaimLinkedEvidenceDTO {
  evidenceId: string
  provider: string
  externalId: string
  evidenceType: string
  title: string | null
  sourceUrl: string | null
  capturedAt: string | null
  linkType: string
  linkConfidence: number
  evidenceDepth: number | null
  reason: string | null
  sourceFile: string | null
}

export interface ClaimEvidenceSummaryDTO {
  claimId: string
  linkedEvidenceCount: number
  linkedEvidence: ClaimLinkedEvidenceDTO[]
}

export interface ClaimDTO {
  id: string
  profileId: string
  resumeVerificationId: string | null
  claimType: string
  rawValue: string
  canonicalSkillId: string | null
  canonicalSkillName: string | null
  source: string
  confidence: number | null
  status: string
  evidenceSummary: ClaimEvidenceSummaryDTO
  createdAt: string
  updatedAt: string
}
