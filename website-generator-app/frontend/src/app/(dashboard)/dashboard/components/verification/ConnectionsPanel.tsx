"use client"

import {
  Award,
  BriefcaseBusiness,
  FileText,
  Globe,
  GraduationCap,
  Link2,
  Lock,
} from "lucide-react"
import { FaLinkedinIn } from "react-icons/fa"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { ConnectionsPanelProps } from "./verification.types"
import ConnectionCard from "./ConnectionCard"

const OTHER_SOURCES = [
  {
    label: "LinkedIn",
    detail: "Profile roles and endorsements",
    Icon: FaLinkedinIn,
    wrapperClassName: "bg-[#0A66C2]/12 ring-1 ring-[#0A66C2]/25",
    iconClassName: "h-4 w-4 text-[#0A66C2]",
  },
  {
    label: "Website",
    detail: "Portfolio pages and case studies",
    Icon: Globe,
    wrapperClassName: "bg-sky-500/10 ring-1 ring-sky-500/20",
    iconClassName: "h-4 w-4 text-sky-600 dark:text-sky-300",
  },
  {
    label: "Projects",
    detail: "Shipped work and public repos",
    Icon: BriefcaseBusiness,
    wrapperClassName: "bg-violet-500/10 ring-1 ring-violet-500/20",
    iconClassName: "h-4 w-4 text-violet-600 dark:text-violet-300",
  },
  {
    label: "Certifications",
    detail: "Issued credentials and awards",
    Icon: Award,
    wrapperClassName: "bg-amber-500/10 ring-1 ring-amber-500/20",
    iconClassName: "h-4 w-4 text-amber-600 dark:text-amber-300",
  },
  {
    label: "Education",
    detail: "School records and coursework",
    Icon: GraduationCap,
    wrapperClassName: "bg-emerald-500/10 ring-1 ring-emerald-500/20",
    iconClassName: "h-4 w-4 text-emerald-600 dark:text-emerald-300",
  },
  {
    label: "Documents",
    detail: "Evidence files and references",
    Icon: FileText,
    wrapperClassName: "bg-zinc-500/10 ring-1 ring-zinc-500/20",
    iconClassName: "h-4 w-4 text-zinc-600 dark:text-zinc-300",
  },
] as const

const OtherSourcesCard = () => (
  <Card className="relative overflow-hidden">
    <Link2
      aria-hidden
      className="pointer-events-none absolute -bottom-8 -right-10 h-56 w-56 rotate-[8deg] text-foreground/[0.06]"
    />
    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-foreground/[0.03] to-transparent" />

    <CardContent className="relative z-10 flex h-full p-0">
      <div className="flex min-w-0 flex-1 flex-col p-4 pr-20">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
              Other sources
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Expand verification beyond GitHub with credential, education, and
              profile evidence.
            </p>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 border-0 bg-muted px-2.5 py-1 text-xs text-muted-foreground"
          >
            Not connected
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OTHER_SOURCES.map((source) => {
            const { label, detail, Icon, wrapperClassName, iconClassName } = source

            return (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-2.5 py-2 text-xs dark:bg-white/[0.035]"
              >
                <div className={cn("rounded-md p-1.5", wrapperClassName)}>
                  <Icon className={iconClassName} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{label}</p>
                  <p className="truncate text-muted-foreground">{detail}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 flex h-8 w-40 items-center gap-1.5 rounded-md bg-muted/50 px-2.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Permission scoped</span>
        </div>
      </div>
    </CardContent>

    <div className="absolute inset-0 z-20 overflow-hidden bg-background/72 px-5 text-center backdrop-blur-[2.5px] dark:bg-black/55">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.58),transparent_58%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_58%)]"
      />
      <Lock
        aria-hidden
        strokeWidth={1.35}
        className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-[58%] text-foreground/[0.09] dark:text-white/[0.11]"
      />
      <div className="relative flex h-full flex-col items-center justify-center">
        <p className="text-sm font-semibold tracking-wide text-foreground">
          Coming soon
        </p>
        <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-foreground/75 dark:text-white/70">
          Multi-source verification is being prepared for this workspace.
        </p>
      </div>
    </div>
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
