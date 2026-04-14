"use client"

import { Github, Linkedin, Globe, Link2, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { ConnectionData, ConnectionProvider, ConnectionsPanelProps } from "./verification.types"
import { getConnectionStatusColor } from "./verification.utils"

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
  onConnect,
  onDisconnect,
}: {
  connection: ConnectionData
  onConnect: (provider: ConnectionProvider) => void
  onDisconnect: (provider: ConnectionProvider) => void
}) => {
  const Icon = PROVIDER_ICONS[connection.provider]
  const isConnected = connection.status === "connected"
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
        <div className="flex items-start justify-between mb-3">
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
                  "text-[10px] mt-0.5 border-0",
                  getConnectionStatusColor(connection.status),
                )}
              >
                {STATUS_LABELS[connection.status]}
              </Badge>
            </div>
          </div>
        </div>

        {isConnected && connectedDate && (
          <p className="text-xs text-muted-foreground mb-1">
            Connected since {connectedDate}
          </p>
        )}

        {isConnected && connection.endorsementCount > 0 && (
          <p className="text-xs text-muted-foreground mb-2">
            {connection.endorsementCount} endorsements imported
          </p>
        )}

        {!isConnected && (
          <p className="text-xs text-amber-500/80 mb-2">
            Can add up to +{connection.potentialPoints} points
          </p>
        )}

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
          <Lock className="h-3 w-3" />
          {connection.permissionScope}
        </div>

        {isConnected ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onDisconnect(connection.provider)}
            >
              Manage
            </Button>
          </div>
        ) : connection.status === "expired" ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs w-full"
            onClick={() => onConnect(connection.provider)}
          >
            Reconnect
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-7 text-xs w-full"
            onClick={() => onConnect(connection.provider)}
          >
            Connect
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

const ConnectionsPanel = ({
  connections,
  onConnect,
  onDisconnect,
}: ConnectionsPanelProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Connected Accounts
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {connections.map((conn) => (
          <ConnectionCard
            key={conn.provider}
            connection={conn}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        ))}
      </div>
    </div>
  )
}

export default ConnectionsPanel
