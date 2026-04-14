export interface ConnectedAccountDTO {
  id: string
  profileId: string
  provider: string
  providerUserId: string | null
  status: string
  scopes: string[]
  lastSyncedAt: string | null
  createdAt: string
  updatedAt: string
}
