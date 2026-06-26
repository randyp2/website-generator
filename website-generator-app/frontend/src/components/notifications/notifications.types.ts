/**
 * Shape of a single in-app notification.
 *
 * NOTE: This mirrors what the (already wired) notifications backend returns so
 * the UI can be swapped from mock data to live data without component changes.
 */
export interface AppNotification {
  id: string
  /** Short headline shown in bold. */
  title: string
  /** Supporting line of detail. */
  body: string
  /** ISO timestamp of when the notification was created. */
  createdAt: string
  /** Whether the user has already read it. */
  read: boolean
}
