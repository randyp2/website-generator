import type { NotificationDTO } from "./notifications.types"

/**
 * Placeholder notifications used while the UI is built out.
 *
 * TODO(dev): replace with live data. Fetch `GET /api/notifications` and feed the
 * returned `notifications` into the same components; nothing else needs to
 * change because everything downstream consumes `NotificationDTO`.
 */

/** Build an ISO timestamp `minutes` in the past, so mock data always looks fresh. */
const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString()

export const MOCK_NOTIFICATIONS: NotificationDTO[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    recipientProfileId: "me",
    actorProfileId: "a1",
    actorName: "Jordan Lee",
    actorUsername: "jordanlee",
    actorAvatarUrl: null,
    type: "portfolio_liked",
    portfolioId: "p1",
    portfolioTitle: "Galaxy Attempt",
    portfolioSlug: "randy-galaxy",
    portfolioScreenshotUrl: "https://picsum.photos/seed/galaxy/640/400",
    commentId: null,
    metadata: null,
    read: false,
    readAt: null,
    createdAt: minutesAgo(3),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    recipientProfileId: "me",
    actorProfileId: "a2",
    actorName: "Sam Rivera",
    actorUsername: "samrivera",
    actorAvatarUrl: null,
    type: "portfolio_commented",
    portfolioId: "p1",
    portfolioTitle: "Galaxy Attempt",
    portfolioSlug: "randy-galaxy",
    portfolioScreenshotUrl: "https://picsum.photos/seed/galaxy/640/400",
    commentId: "c1",
    metadata: { commentPreview: "This is such a clean layout — love the hero!" },
    read: false,
    readAt: null,
    createdAt: minutesAgo(95),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    recipientProfileId: "me",
    actorProfileId: "a3",
    actorName: "Priya Patel",
    actorUsername: "priyap",
    actorAvatarUrl: null,
    type: "comment_replied",
    portfolioId: "p2",
    portfolioTitle: "Design System Showcase",
    portfolioSlug: "design-system",
    portfolioScreenshotUrl: "https://picsum.photos/seed/designsys/640/400",
    commentId: "c2",
    metadata: { commentPreview: "Totally agree, the spacing makes a big difference." },
    read: false,
    readAt: null,
    createdAt: minutesAgo(60 * 6),
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    recipientProfileId: "me",
    actorProfileId: "a4",
    actorName: "Marcus Chen",
    actorUsername: "marcusc",
    actorAvatarUrl: null,
    type: "comment_liked",
    portfolioId: "p2",
    portfolioTitle: "Design System Showcase",
    portfolioSlug: "design-system",
    portfolioScreenshotUrl: null,
    commentId: "c3",
    metadata: null,
    read: true,
    readAt: minutesAgo(60 * 20),
    createdAt: minutesAgo(60 * 26),
  },
]

/** Number of unread notifications, derived from the list. */
export const getUnreadCount = (
  notifications: NotificationDTO[] = MOCK_NOTIFICATIONS,
): number => notifications.filter((notification) => !notification.read).length
