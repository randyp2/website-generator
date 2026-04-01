import Image from "next/image"

import type { PortfolioCard } from "./explore.types"

const DEFAULT_CARD_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

interface PortfolioCardPreviewProps {
  portfolio: PortfolioCard
}

export const PortfolioCardPreview = ({
  portfolio,
}: PortfolioCardPreviewProps) => (
    <div className="relative aspect-[4/2.55] overflow-hidden border-b border-border">
      <Image
        src={DEFAULT_CARD_PREVIEW_IMAGE}
        alt={portfolio.title}
        fill
        sizes="(min-width: 1536px) 22vw, (min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
    </div>
)
