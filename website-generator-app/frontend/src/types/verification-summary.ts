export interface VerificationClaimScoreDTO {
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
  canonicalCategory: string | null
  canonicalWeight: number | null
}

export interface VerificationSuggestedActionDTO {
  claimId: string
  action: string
  reason: string
  priority: number
}

export interface VerificationSummaryDTO {
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
  claims: VerificationClaimScoreDTO[]
  unverifiedClaims: VerificationClaimScoreDTO[]
  suggestedActions: VerificationSuggestedActionDTO[]
  generatedAt: string
}
