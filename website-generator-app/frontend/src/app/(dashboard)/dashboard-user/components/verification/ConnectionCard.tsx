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
  onConnect,
  onDisconnect,
}: ConnectionCardProps) => {
  const { Icon, wrapperClassName, iconClassName } =
    PROVIDER_ICON_CONFIG[connection.provider]
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
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn("rounded-lg p-2", wrapperClassName)}>
              <Icon className={iconClassName} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {connection.displayName}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "mt-0.5 border-0 text-[10px]",
                  getConnectionStatusColor(connection.status),
                )}
              >
                {STATUS_LABELS[connection.status]}
              </Badge>
            </div>
          </div>
        </div>

        {isConnected && connectedDate && (
          <p className="mb-1 text-xs text-muted-foreground">
            Connected since {connectedDate}
          </p>
        )}

        <p className="mb-1 text-xs text-muted-foreground">
          {SYNC_STATUS_LABELS[connection.lastSyncStatus] ?? "Never synced"}
          {lastSyncedDate ? ` (${lastSyncedDate})` : ""}
        </p>

        {connection.lastSyncStatus === "success" && (
          <p className="mb-1 text-xs text-muted-foreground">
            Imported {connection.lastSyncImportedCount} evidence, linked {connection.lastSyncLinkedCount}
          </p>
        )}

        {connection.lastSyncStatus === "failed" && connection.lastSyncError && (
          <p className="mb-1 text-xs text-destructive">
            {connection.lastSyncError}
          </p>
        )}

        {isConnected && connection.endorsementCount > 0 && (
          <p className="mb-2 text-xs text-muted-foreground">
            {connection.endorsementCount} evidence items imported
          </p>
        )}

        {!isConnected && (
          <p className="mb-2 text-xs text-amber-500/80">
            Can add up to +{connection.potentialPoints} points
          </p>
        )}

        <div className="mb-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          {connection.permissionScope}
        </div>

        {isConnected ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              className={DISCONNECT_BUTTON_CLASSES}
              disabled={isBusy}
              onClick={() => onDisconnect(connection.provider)}
            >
              {busyAction === "disconnect" ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
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
      </CardContent>
    </Card>
  )
}

export default ConnectionCard
