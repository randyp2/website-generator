"use client"

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { BellOff, Loader2 } from "lucide-react"

import { NotificationItem } from "@/components/notifications/NotificationItem"
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsInfiniteQuery,
} from "@/components/notifications/notifications.query"
import type { NotificationDTO } from "@/components/notifications/notifications.types"

import { groupNotificationsByRecency } from "./notifications.page.utils"

const PAGE_SIZE = 20

export const NotificationsPageClient = () => {
  const router = useRouter()
  const notificationsQuery = useNotificationsInfiniteQuery(PAGE_SIZE)
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()

  const notifications = useMemo(
    () =>
      notificationsQuery.data?.pages.flatMap((page) => page.notifications) ??
      [],
    [notificationsQuery.data],
  )
  const error = notificationsQuery.error
    ? notificationsQuery.error instanceof Error
      ? notificationsQuery.error.message
      : "Could not load your notifications."
    : null

  const handleSelect = useCallback(
    async (notification: NotificationDTO) => {
      if (!notification.read) {
        void markReadMutation.mutateAsync(notification.id).catch((markError) => {
          console.error("Failed to mark notification as read:", markError)
        })
      }

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

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllReadMutation.mutateAsync()
    } catch (markError) {
      console.error("Failed to mark notifications as read:", markError)
    }
  }, [markAllReadMutation])

  const hasUnread = notifications.some((notification) => !notification.read)
  const groups = groupNotificationsByRecency(notifications)
  const isEmpty =
    !notificationsQuery.isPending && !error && notifications.length === 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Activity on your portfolios and profile.
          </p>
        </div>
        {hasUnread && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="public-action-button public-action-button-outline shrink-0"
          >
            {markAllReadMutation.isPending ? "Marking..." : "Mark all read"}
          </button>
        )}
      </header>

      {/* States */}
      {notificationsQuery.isPending ? (
        <NotificationsSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">{error}</p>
          <button
            type="button"
            onClick={() => void notificationsQuery.refetch()}
            className="public-action-button public-action-button-outline"
          >
            Try again
          </button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <BellOff className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No notifications yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When people like, comment on, or follow your work, you&apos;ll see it
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {group.items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </section>
          ))}

          {notificationsQuery.hasNextPage && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => void notificationsQuery.fetchNextPage()}
                disabled={notificationsQuery.isFetchingNextPage}
                className="public-action-button public-action-button-muted"
              >
                {notificationsQuery.isFetchingNextPage && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {notificationsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Loading placeholder rows that mirror the notification layout. */
const NotificationsSkeleton = () => (
  <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex animate-pulse items-start gap-3 px-4 py-3">
        <div className="size-9 shrink-0 rounded-full bg-muted" />
        <div className="min-w-0 flex-1 space-y-2 py-1">
          <div className="h-3 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
        <div className="aspect-[16/10] w-24 shrink-0 rounded-lg bg-muted" />
      </div>
    ))}
  </div>
)
