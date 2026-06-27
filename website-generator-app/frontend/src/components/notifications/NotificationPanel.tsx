"use client"

import { BellOff } from "lucide-react"

import { NotificationItem } from "./NotificationItem"
import type { NotificationDTO } from "./notifications.types"

interface NotificationPanelProps {
  notifications: NotificationDTO[]
  onSelect?: (notification: NotificationDTO) => void
  onMarkAllRead?: () => void
  onRetry?: () => void
  hasUnread?: boolean
  isLoading?: boolean
  error?: string | null
}

export const NotificationPanel = ({
  notifications,
  onSelect,
  onMarkAllRead,
  onRetry,
  hasUnread = false,
  isLoading = false,
  error = null,
}: NotificationPanelProps) => {
  const isEmpty = notifications.length === 0

  return (
    <div className="flex max-h-[32rem] w-[30rem] max-w-[calc(100vw-2rem)] flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={!hasUnread || isLoading}
          className="text-xs font-medium text-primary transition-colors hover:cursor-pointer hover:text-primary/80 disabled:pointer-events-none disabled:text-muted-foreground"
        >
          Mark all read
        </button>
      </header>

      {/* List / empty state */}
      {isLoading ? (
        <div className="flex flex-col gap-3 px-4 py-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex animate-pulse items-start gap-3">
              <div className="size-9 rounded-full bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
              <div className="aspect-[16/10] w-24 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-medium text-primary transition-colors hover:cursor-pointer hover:text-primary/80"
          >
            Try again
          </button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <BellOff className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No notifications</p>
          <p className="max-w-[16rem] text-xs text-muted-foreground">
            When people interact with your portfolios, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <div className="flex-1 divide-y divide-border overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
