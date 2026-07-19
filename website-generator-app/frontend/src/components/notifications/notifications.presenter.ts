import type { NotificationDTO, NotificationType } from "./notifications.types"

/**
 * Presentation layer: pure functions that translate a raw `NotificationDTO` into
 * display-ready values. No React here — keeps the rendering logic testable and
 * the components free of branching on notification type.
 */

export interface NotificationView {
  id: string
  /** Action sentence, e.g. "liked your portfolio". The actor name is shown separately. */
  action: string
  actorName: string
  actorAvatarUrl: string | null
  /** Title of the related portfolio. */
  portfolioTitle: string
  /** Preview image of the related portfolio (null when unavailable). */
  screenshotUrl: string | null
  /** Secondary context line (portfolio title or a comment preview). */
  context: string | null
  /** Human-friendly relative time, e.g. "3m ago". */
  timeAgo: string
  read: boolean
  /** Stable key used by the component layer to pick an icon. */
  type: NotificationType | string
}

const ACTION_BY_TYPE: Record<NotificationType, string> = {
  portfolio_liked: "liked your portfolio",
  portfolio_commented: "commented on your portfolio",
  comment_replied: "replied to your comment",
  comment_liked: "liked your comment",
  profile_followed: "started following you",
}

/** Reads a short comment preview off metadata when present. */
const getCommentPreview = (notification: NotificationDTO): string | null => {
  const preview = notification.metadata?.commentPreview
  return typeof preview === "string" && preview.trim().length > 0
    ? preview.trim()
    : null
}

/** Builds the secondary context line for a notification. */
const buildContext = (notification: NotificationDTO): string | null => {
  if (notification.type === "profile_followed") {
    return notification.actorUsername ? `@${notification.actorUsername}` : null
  }

  const preview = getCommentPreview(notification)
  if (preview) return `“${preview}”`
  return notification.portfolioTitle || null
}

/** Formats an ISO timestamp as a compact relative string ("just now", "5m ago"). */
export const formatRelativeTime = (
  iso: string,
  now: Date = new Date(),
): string => {
  const deltaSeconds = Math.round((now.getTime() - new Date(iso).getTime()) / 1000)
  if (Number.isNaN(deltaSeconds)) return ""
  if (deltaSeconds < 45) return "just now"

  const minutes = Math.round(deltaSeconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`

  const weeks = Math.round(days / 7)
  if (weeks < 5) return `${weeks}w ago`

  return new Date(iso).toLocaleDateString()
}

/** Maps a raw notification into the view model the UI renders. */
export const toNotificationView = (
  notification: NotificationDTO,
): NotificationView => ({
  id: notification.id,
  action:
    ACTION_BY_TYPE[notification.type as NotificationType] ??
    "sent you a notification",
  actorName: notification.actorName || "Someone",
  actorAvatarUrl: notification.actorAvatarUrl,
  portfolioTitle:
    notification.portfolioTitle ||
    (notification.type === "profile_followed" ? "profile" : "your portfolio"),
  screenshotUrl: notification.portfolioScreenshotUrl ?? null,
  context: buildContext(notification),
  timeAgo: formatRelativeTime(notification.createdAt),
  read: notification.read,
  type: notification.type,
})
