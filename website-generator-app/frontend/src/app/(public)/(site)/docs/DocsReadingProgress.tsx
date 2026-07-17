"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
 */
export const DocsReadingProgress = () => {
  const pathname = usePathname()
  const sections = docSectionsByHref[pathname] ?? []

  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState("")
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if ((docSectionsByHref[pathname] ?? []).length === 0) return

    const content = document.getElementById(DOCS_CONTENT_ID)
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
  }, [pathname])

  useEffect(() => {
    const elements = (docSectionsByHref[pathname] ?? [])
      .map((item) => document.getElementById(sectionIdFromHref(item.href)))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

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

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [pathname])

  if (sections.length === 0) return null

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24">
        <div className="relative pl-6">
          <div className="absolute inset-y-0 left-0 w-px bg-border/70" aria-hidden />
          <div
            className="absolute left-0 top-0 w-px bg-primary transition-[height] duration-150 ease-out"
            style={{ height: `${progress * 100}%` }}
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
