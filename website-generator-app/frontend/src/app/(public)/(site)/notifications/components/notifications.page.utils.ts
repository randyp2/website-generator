import type { NotificationDTO } from "@/components/notifications/notifications.types"

/** A labelled bucket of notifications for the full-page list. */
export interface NotificationGroup {
  label: string
  items: NotificationDTO[]
}

const startOfDay = (date: Date): number => {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

/**
 * Buckets notifications into "Today", "This week", and "Earlier" by `createdAt`.
 * Empty buckets are dropped. Input order is preserved within each bucket
 * (the API already returns newest-first).
 */
export const groupNotificationsByRecency = (
  notifications: NotificationDTO[],
  now: Date = new Date(),
): NotificationGroup[] => {
  const todayStart = startOfDay(now)
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000

  const today: NotificationDTO[] = []
  const thisWeek: NotificationDTO[] = []
  const earlier: NotificationDTO[] = []

  for (const notification of notifications) {
    const createdAt = new Date(notification.createdAt).getTime()
    if (createdAt >= todayStart) today.push(notification)
    else if (createdAt >= weekStart) thisWeek.push(notification)
    else earlier.push(notification)
  }

  return [
    { label: "Today", items: today },
    { label: "This week", items: thisWeek },
    { label: "Earlier", items: earlier },
  ].filter((group) => group.items.length > 0)
}
