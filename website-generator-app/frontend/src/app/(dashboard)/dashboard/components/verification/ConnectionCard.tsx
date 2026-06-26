"use client"

import { Globe, Link2, Lock } from "lucide-react"
import { FaGithub, FaLinkedinIn } from "react-icons/fa"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type {
  ConnectionActionInFlight,
  ConnectionData,
  ConnectionProvider,
} from "./verification.types"
import { getConnectionStatusColor } from "./verification.utils"

interface ConnectionCardProps {
  connection: ConnectionData
  connectionActionInFlight: ConnectionActionInFlight | null
  readOnly?: boolean
  onConnect: (provider: ConnectionProvider) => void
  onDisconnect: (provider: ConnectionProvider) => void
}

const PROVIDER_ICON_CONFIG: Record<
  ConnectionProvider,
  {
    Icon: React.ElementType
    wrapperClassName: string
    iconClassName: string
  }
> = {
  linkedin: {
    Icon: FaLinkedinIn,
    wrapperClassName: "bg-[#0A66C2]/12 ring-1 ring-[#0A66C2]/25",
    iconClassName: "h-5 w-5 text-[#0A66C2]",
  },
  github: {
    Icon: FaGithub,
    wrapperClassName:
      "bg-zinc-900/10 ring-1 ring-zinc-900/20 dark:bg-zinc-100/10 dark:ring-zinc-100/20",
    iconClassName: "h-5 w-5 text-zinc-900 dark:text-zinc-100",
  },
  website: {
    Icon: Globe,
    wrapperClassName: "bg-muted",
    iconClassName: "h-5 w-5 text-foreground",
  },
  other: {
    Icon: Link2,
    wrapperClassName: "bg-muted",
    iconClassName: "h-5 w-5 text-foreground",
  },
}

const STATUS_LABELS: Record<string, string> = {
  connected: "Connected",
  disconnected: "Not Connected",
  expired: "Expired",
  pending: "Pending",
}

const SYNC_STATUS_LABELS: Record<string, string> = {
  never: "Never synced",
  running: "Syncing",
  success: "Last sync successful",
  failed: "Last sync failed",
}

const CONNECT_BUTTON_CLASSES =
  "h-7 w-full text-xs bg-green-700 text-white hover:bg-green-800 focus-visible:ring-green-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:bg-green-700/70"

const RECONNECT_BUTTON_CLASSES =
  "h-7 w-full text-xs border-green-700 text-green-700 hover:bg-green-50 hover:text-green-800 focus-visible:ring-green-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:text-green-700/60"

const DISCONNECT_BUTTON_CLASSES =
  "h-7 text-xs bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:bg-red-700/70"

const ConnectionCard = ({
  connection,
  connectionActionInFlight,
  readOnly = false,
  onConnect,
  onDisconnect,
}: ConnectionCardProps) => {
  const { Icon } = PROVIDER_ICON_CONFIG[connection.provider]
  const isConnected = connection.status === "connected"
  const isBusy = connectionActionInFlight?.provider === connection.provider
  const busyAction = isBusy ? connectionActionInFlight?.action : null
  const connectedDate = connection.connectedAt
    ? new Date(connection.connectedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null
  const lastSyncedDate = connection.lastSyncedAt
    ? new Date(connection.lastSyncedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <Card className="relative overflow-hidden">
      {/* Oversized, translucent provider mark anchored to the right edge */}
      <Icon
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -right-10 h-56 w-56 rotate-[8deg] text-foreground/[0.06]"
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-foreground/[0.03] to-transparent" />

      <CardContent className="relative z-10 flex h-full p-0">
        {/* Content zone — padded clear of the watermark */}
        <div className="flex min-w-0 flex-1 flex-col p-4 pr-24">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
              {connection.displayName}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 border-0 px-2.5 py-1 text-xs",
                getConnectionStatusColor(connection.status),
              )}
            >
              {STATUS_LABELS[connection.status]}
            </Badge>
          </div>

          <div className="mt-2.5 space-y-1 text-xs leading-relaxed text-muted-foreground">
            {isConnected && connectedDate && (
              <p>Connected since {connectedDate}</p>
            )}

            <p>
              {SYNC_STATUS_LABELS[connection.lastSyncStatus] ?? "Never synced"}
              {lastSyncedDate ? ` · ${lastSyncedDate}` : ""}
            </p>

            {connection.lastSyncStatus === "success" && (
              <p>
                Imported {connection.lastSyncImportedCount} evidence · linked{" "}
                {connection.lastSyncLinkedCount}
              </p>
            )}

            {connection.lastSyncStatus === "failed" &&
              connection.lastSyncError && (
                <p className="text-destructive">{connection.lastSyncError}</p>
              )}

            {isConnected && connection.endorsementCount > 0 && (
              <p>{connection.endorsementCount} evidence items imported</p>
            )}

            {!isConnected && !readOnly && (
              <p className="font-medium text-amber-500">
                Can add up to +{connection.potentialPoints} points
              </p>
            )}
          </div>

          <div className="mt-3 flex h-8 w-36 items-center gap-1.5 rounded-md bg-muted/50 px-2.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{connection.permissionScope}</span>
          </div>

          {!readOnly && (
            <div className="mt-auto pt-4">
              {isConnected ? (
                <Button
                  size="sm"
                  className={cn(DISCONNECT_BUTTON_CLASSES, "h-8 w-36 self-start")}
                  disabled={isBusy}
                  onClick={() => onDisconnect(connection.provider)}
                >
                  {busyAction === "disconnect"
                    ? "Disconnecting..."
                    : "Disconnect"}
                </Button>
              ) : connection.status === "expired" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className={RECONNECT_BUTTON_CLASSES}
                  disabled={isBusy}
                  onClick={() => onConnect(connection.provider)}
                >
                  {busyAction === "connect" ? "Connecting..." : "Reconnect"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  className={CONNECT_BUTTON_CLASSES}
                  disabled={isBusy}
                  onClick={() => onConnect(connection.provider)}
                >
                  {busyAction === "connect" ? "Connecting..." : "Connect"}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ConnectionCard
