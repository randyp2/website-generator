"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { BellOff, Loader2 } from "lucide-react"

import { NotificationItem } from "@/components/notifications/NotificationItem"
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/components/notifications/notifications.api"
import type { NotificationDTO } from "@/components/notifications/notifications.types"

import { groupNotificationsByRecency } from "./notifications.page.utils"

const PAGE_SIZE = 20

export const NotificationsPageClient = () => {
  const router = useRouter()
  const [notifications, setNotifications] = React.useState<NotificationDTO[]>([])
  const [page, setPage] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadPage = React.useCallback(
    async (pageToLoad: number, { append }: { append: boolean }) => {
      if (append) setIsLoadingMore(true)
      else setIsLoading(true)
      setError(null)

      try {
        const { notifications: pageItems } = await fetchNotifications({
          page: pageToLoad,
          size: PAGE_SIZE,
        })
        setNotifications((current) =>
          append ? [...current, ...pageItems] : pageItems,
        )
        setPage(pageToLoad)
        setHasMore(pageItems.length === PAGE_SIZE)
      } catch (loadError) {
        console.error("Failed to load notifications:", loadError)
        setError("Could not load your notifications.")
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [],
  )

  React.useEffect(() => {
    void loadPage(0, { append: false })
  }, [loadPage])

  const handleSelect = React.useCallback(
    async (notification: NotificationDTO) => {
      if (!notification.read) {
        setNotifications((current) =>
          current.map((candidate) =>
            candidate.id === notification.id
              ? {
                  ...candidate,
                  read: true,
                  readAt: candidate.readAt ?? new Date().toISOString(),
                }
              : candidate,
          ),
        )
        void markNotificationRead(notification.id).catch((markError) =>
          console.error("Failed to mark notification as read:", markError),
        )
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
    [router],
  )

  const handleMarkAllRead = React.useCallback(async () => {
    const previous = notifications
    const now = new Date().toISOString()
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
        readAt: notification.readAt ?? now,
      })),
    )

    try {
      await markAllNotificationsRead()
    } catch (markError) {
      console.error("Failed to mark notifications as read:", markError)
      setNotifications(previous)
    }
  }, [notifications])

  const hasUnread = notifications.some((notification) => !notification.read)
  const groups = groupNotificationsByRecency(notifications)
  const isEmpty = !isLoading && !error && notifications.length === 0

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
            className="shrink-0 text-sm font-medium text-primary transition-colors hover:cursor-pointer hover:text-primary/80"
          >
            Mark all read
          </button>
        )}
      </header>

      {/* States */}
      {isLoading ? (
        <NotificationsSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">{error}</p>
          <button
            type="button"
            onClick={() => loadPage(0, { append: false })}
            className="text-sm font-medium text-primary transition-colors hover:cursor-pointer hover:text-primary/80"
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

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => loadPage(page + 1, { append: true })}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:cursor-pointer hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
                {isLoadingMore ? "Loading…" : "Load more"}
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
