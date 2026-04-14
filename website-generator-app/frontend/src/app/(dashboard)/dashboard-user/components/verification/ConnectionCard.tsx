"use client"

import { Github, Linkedin, Globe, Link2, Lock } from "lucide-react"

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

const PROVIDER_ICONS: Record<ConnectionProvider, React.ElementType> = {
  linkedin: Linkedin,
  github: Github,
  website: Globe,
  other: Link2,
}

const STATUS_LABELS: Record<string, string> = {
  connected: "Connected",
  disconnected: "Not Connected",
  expired: "Expired",
  pending: "Pending",
}

const ConnectionCard = ({
  connection,
  connectionActionInFlight,
  onConnect,
  onDisconnect,
}: ConnectionCardProps) => {
  const Icon = PROVIDER_ICONS[connection.provider]
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

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-muted p-2">
              <Icon className="h-5 w-5 text-foreground" />
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

        {isConnected && connection.endorsementCount > 0 && (
          <p className="mb-2 text-xs text-muted-foreground">
            {connection.endorsementCount} endorsements imported
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
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
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
            className="h-7 w-full text-xs"
            disabled={isBusy}
            onClick={() => onConnect(connection.provider)}
          >
            {busyAction === "connect" ? "Connecting..." : "Reconnect"}
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-7 w-full text-xs"
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
