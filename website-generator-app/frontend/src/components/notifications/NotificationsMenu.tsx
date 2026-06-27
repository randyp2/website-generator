"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { NotificationBell } from "./NotificationBell"
import { NotificationPanel } from "./NotificationPanel"
import { MOCK_NOTIFICATIONS, getUnreadCount } from "./notifications.mock"

/**
 * Composes the bell trigger with the notifications panel.
 *
 * Currently fed by mock data and the action handlers are intentionally omitted
 * (no-ops). To wire it up: fetch notifications + unread count, then pass them
 * in along with `onSelect` / `onMarkAllRead` / `onViewAll` handlers that call
 * the PATCH endpoints. No presentational changes required.
 */
export const NotificationsMenu = () => {
  const notifications = MOCK_NOTIFICATIONS
  const unreadCount = getUnreadCount(notifications)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <NotificationBell count={unreadCount} />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-auto overflow-hidden rounded-xl p-0"
      >
        <NotificationPanel notifications={notifications} />
      </PopoverContent>
    </Popover>
  )
}
