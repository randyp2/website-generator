"use client"

import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Counts above this render as "N+" to keep the badge compact. */
const MAX_BADGE_COUNT = 99

interface NotificationBellProps {
  /** Number of unread notifications. The badge is hidden when this is 0. */
  count?: number
  /** Click handler. Intentionally optional — currently a no-op placeholder. */
  onClick?: () => void
  className?: string
}

/**
 * Bell icon button with an unread-count badge.
 *
 * Presentational only: it does not fetch anything. Pass `count` from the data
 * layer (see `notifications.mock.ts`) and wire `onClick` when the panel exists.
 */
export const NotificationBell = ({
  count = 0,
  onClick,
  className,
}: NotificationBellProps) => {
  const hasUnread = count > 0
  const displayCount = count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={
        hasUnread ? `Notifications, ${count} unread` : "Notifications"
      }
      className={cn(
        "relative size-9 hover:cursor-pointer hover:bg-transparent hover:text-primary",
        className,
      )}
    >
      <Bell className="size-6" />
      {hasUnread && (
        <span className="absolute -right-1 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-primary-foreground">
          {displayCount}
        </span>
      )}
    </Button>
  )
}
