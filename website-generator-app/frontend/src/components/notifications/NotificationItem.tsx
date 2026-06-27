"use client"

import * as React from "react"
import {
  Heart,
  MessageSquare,
  CornerUpLeft,
  ThumbsUp,
  Image as ImageIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import type { NotificationDTO, NotificationType } from "./notifications.types"
import { toNotificationView } from "./notifications.presenter"

/** Small accent icon shown over the actor avatar, keyed by notification type. */
const ICON_BY_TYPE: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  portfolio_liked: Heart,
  portfolio_commented: MessageSquare,
  comment_replied: CornerUpLeft,
  comment_liked: ThumbsUp,
}

/** Portfolio preview thumbnail with a graceful fallback. */
const PortfolioThumbnail = ({
  src,
  alt,
}: {
  src: string | null
  alt: string
}) => {
  const [failed, setFailed] = React.useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src ?? undefined}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-card">
          <ImageIcon className="size-4 text-muted-foreground/50" />
        </div>
      )}
    </div>
  )
}

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

interface NotificationItemProps {
  notification: NotificationDTO
  /** Placeholder click handler — wire to mark-as-read / navigation later. */
  onSelect?: (notification: NotificationDTO) => void
}

export const NotificationItem = ({
  notification,
  onSelect,
}: NotificationItemProps) => {
  const view = toNotificationView(notification)
  const TypeIcon = ICON_BY_TYPE[notification.type as NotificationType] ?? Heart

  return (
    <button
      type="button"
      onClick={() => onSelect?.(notification)}
      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:cursor-pointer hover:bg-primary/5"
    >
      {/* Avatar with type badge */}
      <div className="relative shrink-0">
        <Avatar className="size-9">
          <AvatarImage
            src={view.actorAvatarUrl ?? undefined}
            alt={view.actorName}
          />
          <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
            {initialsOf(view.actorName)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-popover">
          <TypeIcon className="size-2.5" />
        </span>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-foreground">
          <span className="font-semibold">{view.actorName}</span>{" "}
          <span className="text-muted-foreground">{view.action}</span>
        </p>
        {view.context && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {view.context}
          </p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground/80">{view.timeAgo}</p>
      </div>

      {/* Portfolio preview */}
      <PortfolioThumbnail src={view.screenshotUrl} alt={view.portfolioTitle} />

      {/* Unread dot */}
      {!view.read && (
        <span
          className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
          aria-label="Unread"
        />
      )}
    </button>
  )
}
