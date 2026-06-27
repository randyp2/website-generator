import type {
  NotificationDTO,
  NotificationListResponse,
  UnreadCountResponse,
} from "./notifications.types"

interface FetchNotificationsOptions {
  page?: number
  size?: number
}

interface MarkAllReadResponse {
  updatedCount: number
}

const readJson = async <T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> => {
  if (response.ok) {
    return (await response.json()) as T
  }

  let message = fallbackMessage
  try {
    const payload = (await response.json()) as { error?: unknown; message?: unknown }
    if (typeof payload.error === "string") {
      message = payload.error
    } else if (typeof payload.message === "string") {
      message = payload.message
    }
  } catch {
    const text = await response.text().catch(() => "")
    if (text) message = text
  }

  throw new Error(message)
}

export const fetchNotifications = async ({
  page = 0,
  size = 20,
}: FetchNotificationsOptions = {}): Promise<NotificationListResponse> => {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  })

  const response = await fetch(`/api/notifications?${searchParams.toString()}`, {
    cache: "no-store",
    credentials: "same-origin",
  })

  return readJson<NotificationListResponse>(
    response,
    "Failed to load notifications.",
  )
}

export const fetchUnreadNotificationCount =
  async (): Promise<UnreadCountResponse> => {
    const response = await fetch("/api/notifications/unread-count", {
      cache: "no-store",
      credentials: "same-origin",
    })

    return readJson<UnreadCountResponse>(
      response,
      "Failed to load unread notifications.",
    )
  }

export const markNotificationRead = async (
  notificationId: string,
): Promise<NotificationDTO> => {
  const response = await fetch(
    `/api/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "PATCH",
      cache: "no-store",
      credentials: "same-origin",
    },
  )

  return readJson<NotificationDTO>(
    response,
    "Failed to mark notification as read.",
  )
}

export const markAllNotificationsRead =
  async (): Promise<MarkAllReadResponse> => {
    const response = await fetch("/api/notifications/read-all", {
      method: "PATCH",
      cache: "no-store",
      credentials: "same-origin",
    })

    return readJson<MarkAllReadResponse>(
      response,
      "Failed to mark notifications as read.",
    )
  }
