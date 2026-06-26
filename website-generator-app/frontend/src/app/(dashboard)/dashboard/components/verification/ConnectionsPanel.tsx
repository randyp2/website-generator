"use client"

import { Globe, Link2, Sparkles } from "lucide-react"
import { FaGithub, FaLinkedinIn } from "react-icons/fa"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { ConnectionsPanelProps } from "./verification.types"
import ConnectionCard from "./ConnectionCard"

const OTHER_SOURCES = [
  {
    label: "LinkedIn",
    Icon: FaLinkedinIn,
    wrapperClassName: "bg-[#0A66C2]/12 ring-1 ring-[#0A66C2]/25",
    iconClassName: "h-4 w-4 text-[#0A66C2]",
  },
  {
    label: "Website",
    Icon: Globe,
    wrapperClassName: "bg-muted",
    iconClassName: "h-4 w-4 text-foreground",
  },
  {
    label: "Other sources",
    Icon: Link2,
    wrapperClassName: "bg-muted",
    iconClassName: "h-4 w-4 text-foreground",
  },
] as const

const OtherSourcesCard = () => (
  <Card className="relative overflow-hidden border-dashed">
    <CardContent className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-muted p-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Other sources</p>
            <Badge
              variant="outline"
              className="mt-0.5 border-0 bg-amber-500/15 text-[10px] text-amber-500"
            >
              Coming soon
            </Badge>
          </div>
        </div>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        More verification providers are on the way. For now, connect GitHub to
        verify your work.
      </p>

      <div className="mt-auto space-y-1.5">
        {OTHER_SOURCES.map(({ label, Icon, wrapperClassName, iconClassName }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <div className={cn("rounded-md p-1.5", wrapperClassName)}>
              <Icon className={iconClassName} />
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

const ConnectionsPanel = ({
  connections,
  connectionActionInFlight = null,
  readOnly = false,
  onConnect,
  onDisconnect,
}: ConnectionsPanelProps) => {
  const githubConnection = connections.find(
    (conn) => conn.provider === "github",
  )

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Connected Accounts
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {githubConnection && (
          <ConnectionCard
            key={githubConnection.provider}
            connection={githubConnection}
            connectionActionInFlight={connectionActionInFlight}
            readOnly={readOnly}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        )}
        <OtherSourcesCard />
      </div>
    </div>
  )
}

export default ConnectionsPanel
