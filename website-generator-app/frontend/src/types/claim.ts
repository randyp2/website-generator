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
  createdAt: string
  updatedAt: string
}
