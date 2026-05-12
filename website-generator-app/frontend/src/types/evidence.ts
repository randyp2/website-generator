export interface EvidenceLinkDTO {
  claimId: string
  linkType: string
  linkConfidence: number
  reason: string | null
}

export interface EvidenceDTO {
  id: string
  profileId: string
  provider: string
  externalId: string
  evidenceType: string
  title: string | null
  description: string | null
  sourceUrl: string | null
  occurredAt: string | null
  capturedAt: string
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  links: EvidenceLinkDTO[]
}

export interface EvidenceListResponseDTO {
  items: EvidenceDTO[]
}
