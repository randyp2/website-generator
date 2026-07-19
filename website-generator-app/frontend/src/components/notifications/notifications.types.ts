/**
 * Frontend mirror of the backend notification contract.
 *
 * Backend source of truth:
 *   - DTO:    webgen-backend ... notification/dto/NotificationDTO.java
 *   - Routes (proxied under /api/notifications):
 *       GET   /api/notifications?page=&size=  -> NotificationListResponse
 *       GET   /api/notifications/unread-count -> UnreadCountResponse
 *       PATCH /api/notifications/{id}/read    -> NotificationDTO
 *       PATCH /api/notifications/read-all      -> { updatedCount: number }
 *
 * Keeping these in sync means swapping mock data for live fetches later requires
 * no changes to the presenter or components.
 */

/** Notification kinds emitted by the backend (NotificationService constants). */
export type NotificationType =
  | "portfolio_liked"
  | "portfolio_commented"
  | "comment_replied"
  | "comment_liked"
  | "profile_followed"

export interface NotificationDTO {
  id: string
  recipientProfileId: string
  actorProfileId: string | null
  actorName: string | null
  actorUsername: string | null
  actorAvatarUrl: string | null
  /** One of NotificationType; typed loosely to tolerate future server values. */
  type: NotificationType | (string & {})
  portfolioId: string | null
  portfolioTitle: string | null
  portfolioSlug: string | null
  /** Preview image of the related portfolio. Null for profile-scoped notifications or missing screenshots. */
  portfolioScreenshotUrl: string | null
  commentId: string | null
  /** Arbitrary server-attached JSON (e.g. a comment preview). */
  metadata: Record<string, unknown> | null
  read: boolean
  readAt: string | null
  createdAt: string
}

/** Response of `GET /api/notifications`. */
export interface NotificationListResponse {
  notifications: NotificationDTO[]
}

/** Response of `GET /api/notifications/unread-count`. */
export interface UnreadCountResponse {
  unreadCount: number
}
