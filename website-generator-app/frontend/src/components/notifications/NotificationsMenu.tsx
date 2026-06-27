"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { NotificationBell } from "./NotificationBell"
import { NotificationPanel } from "./NotificationPanel"
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications.api"
import type { NotificationDTO } from "./notifications.types"

/**
 * Composes the bell trigger with the notifications panel.
 */
export const NotificationsMenu = () => {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<NotificationDTO[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadUnreadCount = React.useCallback(async () => {
    try {
      const response = await fetchUnreadNotificationCount()
      setUnreadCount(response.unreadCount)
    } catch (error) {
      console.error("Failed to load unread notifications:", error)
    }
  }, [])

  const loadNotifications = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        fetchNotifications({ page: 0, size: 20 }),
        fetchUnreadNotificationCount(),
      ])

      const loadedNotifications = notificationsResponse.notifications
      const loadedUnreadCount = unreadCountResponse.unreadCount
      const hasUnread =
        loadedUnreadCount > 0 ||
        loadedNotifications.some((notification) => !notification.read)

      if (!hasUnread) {
        setNotifications(loadedNotifications)
        setUnreadCount(loadedUnreadCount)
        return
      }

      const now = new Date().toISOString()
      setNotifications(
        loadedNotifications.map((notification) => ({
          ...notification,
          read: true,
          readAt: notification.readAt ?? now,
        })),
      )
      setUnreadCount(0)

      void markAllNotificationsRead().catch((error) => {
        console.error("Failed to mark notifications as read:", error)
        setNotifications(loadedNotifications)
        setUnreadCount(loadedUnreadCount)
      })
    } catch (error) {
      console.error("Failed to load notifications:", error)
      setError("Could not load notifications.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadUnreadCount()
  }, [loadUnreadCount])

  React.useEffect(() => {
    if (open) {
      void loadNotifications()
    }
  }, [loadNotifications, open])

  const markNotificationLocallyRead = React.useCallback(
    (notificationId: string) => {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                read: true,
                readAt: notification.readAt ?? new Date().toISOString(),
              }
            : notification,
        ),
      )
      setUnreadCount((current) => Math.max(0, current - 1))
    },
    [],
  )

  const handleSelect = React.useCallback(
    async (notification: NotificationDTO) => {
      if (!notification.read) {
        markNotificationLocallyRead(notification.id)
        try {
          const updatedNotification = await markNotificationRead(notification.id)
          setNotifications((current) =>
            current.map((candidate) =>
              candidate.id === updatedNotification.id
                ? {
                    ...candidate,
                    ...updatedNotification,
                  }
                : candidate,
            ),
          )
        } catch (error) {
          console.error("Failed to mark notification as read:", error)
          void loadUnreadCount()
        }
      }

      setOpen(false)
      if (notification.portfolioSlug) {
        router.push(`/explore/${encodeURIComponent(notification.portfolioSlug)}`)
      } else if (
        notification.type === "profile_followed" &&
        notification.actorUsername
      ) {
        router.push(`/${encodeURIComponent(notification.actorUsername)}`)
      }
    },
    [loadUnreadCount, markNotificationLocallyRead, router],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <NotificationBell count={unreadCount} />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-auto overflow-hidden rounded-xl p-0"
      >
        <NotificationPanel
          notifications={notifications}
          onSelect={handleSelect}
          onRetry={loadNotifications}
          isLoading={isLoading}
          error={error}
        />
      </PopoverContent>
    </Popover>
  )
}
