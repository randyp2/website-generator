import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { getPortfolioInitials } from "./explore.utils"

interface PortfolioCardOwnerProps {
  ownerName: string | null
  ownerAvatarUrl: string | null
}

export const PortfolioCardOwner = ({
  ownerName,
  ownerAvatarUrl,
}: PortfolioCardOwnerProps) => {
  const displayName = ownerName ?? "Anonymous Creator"

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-11 w-11 border border-white/10 bg-white/5">
        <AvatarImage src={ownerAvatarUrl ?? undefined} alt={displayName} />
        <AvatarFallback className="bg-cyan-300/10 text-xs font-semibold text-cyan-100">
          {getPortfolioInitials(ownerName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{displayName}</p>
        <p className="truncate text-xs text-slate-400">Public portfolio creator</p>
      </div>
    </div>
  )
}
