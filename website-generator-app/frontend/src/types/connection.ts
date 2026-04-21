export interface ConnectedAccountDTO {
  id: string
  profileId: string
  provider: string
  providerUserId: string | null
  status: string
  scopes: string[]
  lastSyncedAt: string | null
  lastSyncStatus: string
  lastSyncError: string | null
  lastSyncStartedAt: string | null
  lastSyncCompletedAt: string | null
  lastSyncImportedCount: number
  lastSyncLinkedCount: number
  createdAt: string
  updatedAt: string
}

export interface ConnectProviderResponseDTO {
  connection: ConnectedAccountDTO
  authorizationUrl: string | null
  state: string | null
}

export interface DisconnectProviderResponseDTO {
  connection: ConnectedAccountDTO
}

export interface SyncEvidenceStatsDTO {
  fetched: number
  inserted: number
  updated: number
  unchanged: number
}

export interface SyncLinkStatsDTO {
  inserted: number
  updated: number
  removed: number
  claimsMatched: number
}

export interface SyncProviderResponseDTO {
  provider: string
  syncStatus: string
  startedAt: string | null
  completedAt: string | null
  tokenRefreshed: boolean
  evidence: SyncEvidenceStatsDTO
  links: SyncLinkStatsDTO
  error: string | null
}
