"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { FiChevronUp, FiImage, FiLayers } from "react-icons/fi"

import { cn } from "@/lib/utils"
import type { Portfolio } from "@/types/portfolio"

import { PublishLiveCard } from "./PublishLiveCard"

const DECK_THRESHOLD = 3

/** A non-interactive card-shaped layer that shows a portfolio's screenshot,
 *  used behind the top card so the deck's pictures peek out. */
const DeckPeek = ({
  portfolio,
  className,
}: {
  portfolio: Portfolio
  className: string
}) => {
  const screenshotUrl = portfolio.screenshot_url?.trim() || null
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(screenshotUrl) && !failed
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform duration-300 ease-out",
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={screenshotUrl ?? undefined}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-card">
          <FiImage className="h-5 w-5 text-muted-foreground/50" />
        </div>
      )}
    </div>
  )
}

interface PublishLiveDeckProps {
  live: Portfolio[]
  ownerName: string
  featuredPortfolioId: string | null
  copiedSlug: string | null
  onSelectFeatured: (portfolioId: string) => void
  onCopyUrl: (slug: string, externalUrl?: string | null) => void
  onUnpublish: (portfolioId: string) => void
}

export const PublishLiveDeck = ({
  live,
  ownerName,
  featuredPortfolioId,
  copiedSlug,
  onSelectFeatured,
  onCopyUrl,
  onUnpublish,
}: PublishLiveDeckProps) => {
  const [expanded, setExpanded] = useState(false)
  const isDeck = live.length >= DECK_THRESHOLD

  // Featured card sits on top of the deck.
  const ordered = useMemo(() => {
    if (!featuredPortfolioId) return live
    const featured = live.find((p) => String(p.id) === featuredPortfolioId)
    if (!featured) return live
    return [featured, ...live.filter((p) => p !== featured)]
  }, [live, featuredPortfolioId])

  const renderCard = (
    portfolio: Portfolio,
    onClick: () => void,
    enableHover = true,
  ) => {
    const portfolioId = String(portfolio.id)
    const slug = portfolio.slug ?? null
    const externalUrl =
      (portfolio.external_url ?? portfolio.externalUrl ?? null)?.trim() || null
    return (
      <PublishLiveCard
        portfolio={portfolio}
        ownerName={ownerName}
        isFeatured={portfolioId === featuredPortfolioId}
        copied={copiedSlug !== null && copiedSlug === slug}
        enableHover={enableHover}
        onClick={onClick}
        onCopyUrl={() => slug && onCopyUrl(slug, externalUrl)}
        onUnpublish={() => onUnpublish(portfolioId)}
      />
    )
  }

  // Plain stack when there aren't enough cards to be worth decking.
  if (!isDeck) {
    return (
      <div className="space-y-3">
        {ordered.map((portfolio) => (
          <div key={String(portfolio.id)}>
            {renderCard(portfolio, () =>
              onSelectFeatured(String(portfolio.id)),
            )}
          </div>
        ))}
      </div>
    )
  }

  // Collapsed deck: featured card on top with peeking edges behind it.
  if (!expanded) {
    const [top] = ordered
    // The next two cards form the staggered layers behind the top one. Render
    // furthest-first so DOM paint order puts them behind, and let their actual
    // screenshots peek out above the top card.
    const behind = ordered.slice(1, 3).reverse()
    // base offset + extra spread the stack fans out to on hover.
    const peekStyles = [
      "inset-x-8 bottom-5 group-hover/deck:-translate-y-3", // furthest
      "inset-x-4 bottom-2.5 group-hover/deck:-translate-y-1.5", // closer
    ]
    return (
      <div className="pt-9">
        <div className="group/deck relative cursor-pointer">
          {behind.map((portfolio, index) => (
            <DeckPeek
              key={String(portfolio.id)}
              portfolio={portfolio}
              className={peekStyles[index] ?? peekStyles[peekStyles.length - 1]}
            />
          ))}
          <motion.div layoutId="deck-top" className="relative z-10">
            {renderCard(top, () => setExpanded(true), false)}
          </motion.div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-transparent px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:cursor-pointer hover:border-primary/50 hover:bg-muted/30 hover:text-foreground"
        >
          <FiLayers className="h-3.5 w-3.5" />
          Show all {live.length} live
        </button>
      </div>
    )
  }

  // Expanded: the cards behind deal out at the top while the deck's top card
  // slides down to become the bottom-most card.
  const topId = String(ordered[0].id)
  const expandedOrder = [...ordered.slice(1), ordered[0]]
  return (
    <div className="space-y-3">
      {expandedOrder.map((portfolio, index) => {
        const isTopCard = String(portfolio.id) === topId
        return (
          <motion.div
            key={String(portfolio.id)}
            layout
            layoutId={isTopCard ? "deck-top" : undefined}
            initial={isTopCard ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: isTopCard ? 0 : index * 0.04,
            }}
          >
            {renderCard(portfolio, () =>
              onSelectFeatured(String(portfolio.id)),
            )}
          </motion.div>
        )
      })}
      <button
        type="button"
        onClick={() => setExpanded(false)}
        aria-expanded
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-transparent px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:cursor-pointer hover:border-primary/50 hover:bg-muted/30 hover:text-foreground"
      >
        <FiChevronUp className="h-3.5 w-3.5" />
        Collapse into deck
      </button>
    </div>
  )
}
