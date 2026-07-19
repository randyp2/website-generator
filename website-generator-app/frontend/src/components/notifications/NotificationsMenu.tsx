"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { NotificationBell } from "./NotificationBell"
import { NotificationPanel } from "./NotificationPanel"
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationPreviewQuery,
  useUnreadNotificationCountQuery,
} from "./notifications.query"
import type { NotificationDTO } from "./notifications.types"

const NOTIFICATION_PREVIEW_SIZE = 20

/**
 * Composes the bell trigger with the notifications panel.
 */
export const NotificationsMenu = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const {
    data: unreadCount = 0,
  } = useUnreadNotificationCountQuery()
  const previewQuery = useNotificationPreviewQuery({
    enabled: open,
    size: NOTIFICATION_PREVIEW_SIZE,
  })
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()

  const notifications = useMemo(
    () => previewQuery.data?.notifications ?? [],
    [previewQuery.data],
  )
  const hasUnread =
    unreadCount > 0 || notifications.some((notification) => !notification.read)
  const error = previewQuery.error
    ? previewQuery.error instanceof Error
      ? previewQuery.error.message
      : "Could not load notifications."
    : null

  useEffect(() => {
    if (!open || !previewQuery.isSuccess || !hasUnread) return
    if (markAllReadMutation.isPending) return

    markAllReadMutation.mutate(undefined, {
      onError: (error) => {
        console.error("Failed to mark notifications as read:", error)
      },
    })
  }, [
    hasUnread,
    markAllReadMutation,
    notifications,
    open,
    previewQuery.isSuccess,
  ])

  const handleSelect = useCallback(
    async (notification: NotificationDTO) => {
      if (!notification.read) {
        try {
          await markReadMutation.mutateAsync(notification.id)
        } catch (error) {
          console.error("Failed to mark notification as read:", error)
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
    [markReadMutation, router],
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
          onViewAll={() => {
            setOpen(false)
            router.push("/notifications")
          }}
          onRetry={() => void previewQuery.refetch()}
          isLoading={previewQuery.isPending}
          error={error}
        />
      </PopoverContent>
    </Popover>
  )
}
