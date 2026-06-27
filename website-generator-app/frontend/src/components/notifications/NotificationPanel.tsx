"use client"

import { BellOff } from "lucide-react"

import { NotificationItem } from "./NotificationItem"
import type { NotificationDTO } from "./notifications.types"

interface NotificationPanelProps {
  notifications: NotificationDTO[]
  /** Placeholder actions — currently no-ops; wire to the API later. */
  onSelect?: (notification: NotificationDTO) => void
  onViewAll?: () => void
}

export const NotificationPanel = ({
  notifications,
  onSelect,
  onViewAll,
}: NotificationPanelProps) => {
  const isEmpty = notifications.length === 0

  return (
    <div className="flex max-h-[32rem] w-[30rem] max-w-[calc(100vw-2rem)] flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-medium text-primary transition-colors hover:cursor-pointer hover:text-primary/80"
        >
          View all
        </button>
      </header>

      {/* List / empty state */}
      {isEmpty ? (
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
