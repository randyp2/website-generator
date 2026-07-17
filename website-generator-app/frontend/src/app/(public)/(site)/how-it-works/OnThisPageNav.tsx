"use client"

import Link from "next/link"
import { Layers3, LayoutTemplate } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export type TocItem = {
  href: string
  label: string
}

type OnThisPageNavProps = {
  items: TocItem[]
  /** Id of the scrollable content region used to compute scroll progress. */
  contentId: string
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const sectionIdFromHref = (href: string) => href.replace(/^#/, "")

/**
 * Sticky "On this page" navigation.
 *
 * Tracks the reader's scroll position to (1) fill the vertical guide line with
 * the primary (orange) color proportionally to overall progress through the
 * content region, and (2) highlight the table-of-contents entry for the section
 * currently in view.
 */
export const OnThisPageNav = ({ items, contentId }: OnThisPageNavProps) => {
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState<string>(
    items.length > 0 ? sectionIdFromHref(items[0].href) : "",
  )
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const content = document.getElementById(contentId)
    if (!content) return

    const updateProgress = () => {
      frame.current = null
      const rect = content.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) {
        setProgress(1)
        return
      }
      setProgress(clamp(-rect.top / scrollable, 0, 1))
    }

    const onScroll = () => {
      if (frame.current !== null) return
      frame.current = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
    }
  }, [contentId])

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(sectionIdFromHref(item.href)))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      // Bias the active region toward the upper third of the viewport so the
      // highlight tracks the section the reader is actually looking at.
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [items])

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <div className="relative pl-6">
          <div className="absolute inset-y-0 left-0 w-px bg-border/70" aria-hidden />
          <div
            className="absolute left-0 top-0 w-px bg-primary transition-[height] duration-150 ease-out"
            style={{ height: `${progress * 100}%` }}
            aria-hidden
          />

          <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            On this page
          </p>
          <nav className="mt-5 space-y-3">
            {items.map((item, index) => {
              const isActive = sectionIdFromHref(item.href) === activeId
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 text-sm transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    className={`text-xs transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground/70"
                    }`}
                  >
                    0{index + 1}
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-10 rounded-xl border border-border/70 bg-card/[0.28] px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Layers3 className="size-4 text-primary" />
              Workflow summary
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Input content, generate structure, refine output, then publish from the
              saved dashboard flow.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <LayoutTemplate className="size-3.5" />
              Resume to portfolio
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
