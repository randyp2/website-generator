"use client"

import type {
  ConnectionsPanelProps,
} from "./verification.types"
import ConnectionCard from "./ConnectionCard"

const ConnectionsPanel = ({
  connections,
  connectionActionInFlight = null,
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
            connectionActionInFlight={connectionActionInFlight}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        ))}
      </div>
    </div>
  )
}

export default ConnectionsPanel
