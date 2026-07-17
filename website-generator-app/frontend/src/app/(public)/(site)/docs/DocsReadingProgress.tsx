"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { DOCS_CONTENT_ID, docSectionsByHref } from "./docs-config"

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const sectionIdFromHref = (href: string) => href.replace(/^#/, "")

/**
 * Sticky reading-progress rail shown on the far right of the docs layout.
 *
 * It reads the current route's sections from `docSectionsByHref`, so the docs
 * layout can stay a server component. As the reader scrolls it (1) fills the
 * vertical guide line with the primary color proportionally to progress through
 * the content region, and (2) highlights the section currently in view. Renders
 * nothing on docs that declare no sections.
 *
 * The fill is a GPU `scaleY` transform from `origin-top` (not an animated
 * `height`, which reflows every frame) fed through a spring, so the bar eases
 * smoothly instead of jumping between scroll samples.
 */
export const DocsReadingProgress = () => {
  const pathname = usePathname()
  const sections = docSectionsByHref[pathname] ?? []

  const [activeId, setActiveId] = useState("")
  const progress = useMotionValue(0)
  const smoothProgress = useSpring(progress, {
    stiffness: 140,
    damping: 28,
    mass: 0.35,
  })
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const items = docSectionsByHref[pathname] ?? []
    if (items.length === 0) return

    const content = document.getElementById(DOCS_CONTENT_ID)
    if (!content) return

    const sections = items
      .map((item) => document.getElementById(sectionIdFromHref(item.href)))
      .filter((el): el is HTMLElement => el !== null)

    const update = () => {
      frame.current = null

      const rect = content.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      progress.set(scrollable <= 0 ? 1 : clamp(-rect.top / scrollable, 0, 1))

      if (sections.length === 0) return

      // Active = the last section whose top has crossed an activation line near
      // the upper third of the viewport. A bottom-of-page fallback pins the last
      // section, since sections against the page end can never scroll their top
      // up to the line.
      const activationLine = window.innerHeight * 0.3
      let currentId = sections[0].id
      for (const section of sections) {
        if (section.getBoundingClientRect().top - activationLine <= 0) {
          currentId = section.id
        } else {
          break
        }
      }
      const reachedBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      if (reachedBottom) {
        currentId = sections[sections.length - 1].id
      }

      setActiveId((previous) => (previous === currentId ? previous : currentId))
    }

    const onScroll = () => {
      if (frame.current !== null) return
      frame.current = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
    }
  }, [pathname, progress])

  if (sections.length === 0) return null

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24">
        <div className="relative pl-6">
          <div className="absolute inset-y-0 left-0 w-px bg-border/70" aria-hidden />
          <motion.div
            className="absolute inset-y-0 left-0 w-px origin-top bg-primary"
            style={{ scaleY: smoothProgress }}
            aria-hidden
          />

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            On this page
          </p>
          <nav className="mt-5 space-y-3">
            {sections.map((item, index) => {
              const isActive = sectionIdFromHref(item.href) === activeId
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex items-center gap-3 text-sm transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
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
        </div>
      </div>
    </aside>
  )
}
