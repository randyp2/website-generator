import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { getPortfolioInitials } from "./explore.utils"

interface PortfolioCardOwnerProps {
  ownerName: string | null
  ownerAvatarUrl: string | null
  publishedLabel: string
}

export const PortfolioCardOwner = ({
  ownerName,
  ownerAvatarUrl,
  publishedLabel,
}: PortfolioCardOwnerProps) => {
  const displayName = ownerName ?? "Anonymous Creator"

  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="h-9 w-9 border border-border bg-background">
        <AvatarImage src={ownerAvatarUrl ?? undefined} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
          {getPortfolioInitials(ownerName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
          <span className="shrink-0 text-xs text-muted-foreground">{publishedLabel}</span>
        </div>
        <p className="truncate text-xs text-muted-foreground">Public portfolio creator</p>
      </div>
    </div>
  )
}
