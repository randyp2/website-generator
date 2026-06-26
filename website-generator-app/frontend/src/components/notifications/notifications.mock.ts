import type { AppNotification } from "./notifications.types"

/**
 * Placeholder notifications used while the UI is built out.
 *
 * TODO(dev): replace with data from the notifications API
 * (`/api/notifications`, `/api/notifications/unread-count`). The component layer
 * reads from `getUnreadCount()` / this list, so wiring the real source later
 * should not require touching the presentational components.
 */
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "1",
    title: "New follower",
    body: "Jordan Lee started following you.",
    createdAt: "2026-06-26T14:32:00.000Z",
    read: false,
  },
  {
    id: "2",
    title: "Portfolio liked",
    body: "Your “Galaxy Attempt” portfolio got a new like.",
    createdAt: "2026-06-26T11:05:00.000Z",
    read: false,
  },
  {
    id: "3",
    title: "New comment",
    body: "Sam Rivera commented on your portfolio.",
    createdAt: "2026-06-25T19:48:00.000Z",
    read: false,
  },
  {
    id: "4",
    title: "Featured on Explore",
    body: "Your portfolio was featured on the Explore feed.",
    createdAt: "2026-06-24T09:12:00.000Z",
    read: true,
  },
]

/** Number of unread notifications, derived from the list. */
export const getUnreadCount = (
  notifications: AppNotification[] = MOCK_NOTIFICATIONS,
): number => notifications.filter((notification) => !notification.read).length
