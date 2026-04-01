"use client";

import { Search } from "lucide-react"
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { ExploreEmptyState } from "./ExploreEmptyState"
import { ExploreGrid } from "./ExploreGrid"
import type { ExploreFilter, PageResponse, PortfolioCard } from "./explore.types"
import { matchesPortfolioFilter } from "./explore.utils"

const FILTER_OPTIONS: Array<{ id: ExploreFilter; label: string }> = [
  { id: "all", label: "All portfolios" },
  { id: "templated", label: "Template based" },
  { id: "recent", label: "Recently published" },
]

export const ExplorePageClient = () => {
  const [portfolios, setPortfolios] = useState<PortfolioCard[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<ExploreFilter>("all")
  const observerRef = useRef<HTMLDivElement | null>(null)
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const fetchPage = useCallback(async (pageNum: number) => {
    const res = await fetch(`/api/public/portfolio?page=${pageNum}&size=12`)
    if (!res.ok) return null
    return (await res.json()) as PageResponse
  }, [])

  useEffect(() => {
    const load = async () => {
      const data = await fetchPage(0)
      if (data) {
        setPortfolios(data.content)
        setIsLast(data.last)
      }
      setLoading(false)
    }
    load()
  }, [fetchPage])

  const loadMore = useCallback(async () => {
    if (loadingMore || isLast) return
    setLoadingMore(true)
    const nextPage = page + 1
    const data = await fetchPage(nextPage)
    if (data) {
      setPortfolios((prev) => [...prev, ...data.content])
      setPage(nextPage)
      setIsLast(data.last)
    }
    setLoadingMore(false)
  }, [loadingMore, isLast, page, fetchPage])

  useEffect(() => {
    const el = observerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  const filteredPortfolios = portfolios.filter((portfolio) =>
    matchesPortfolioFilter(portfolio, activeFilter, deferredSearchQuery),
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 pb-16 pt-8 md:px-8 md:pt-10">
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-8 md:px-8 md:pt-10">
      <section className="mx-auto mb-8 max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.34em] text-primary/70">
              Discover public work
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Portfolio cards with stronger signals, faster scanning, and cleaner actions.
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
              Browse live portfolio builds from creators using your generator. Search by title,
              creator, slug, or template and jump straight into any published project.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => {
                  const nextValue = event.target.value
                  startTransition(() => setSearchQuery(nextValue))
                }}
                placeholder="Search portfolios, creators, templates..."
                className="pl-11"
              />
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant={activeFilter === option.id ? "secondary" : "ghost"}
                className={
                  activeFilter === option.id
                    ? "rounded-full"
                    : "rounded-full border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }
                onClick={() => setActiveFilter(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredPortfolios.length}</span>{" "}
            of <span className="font-semibold text-foreground">{portfolios.length}</span> published portfolios
          </p>
        </div>
      </section>

      {portfolios.length === 0 ? (
        <ExploreEmptyState />
      ) : filteredPortfolios.length === 0 ? (
        <ExploreEmptyState hasQuery />
      ) : (
        <>
          <ExploreGrid items={filteredPortfolios} />
          <div ref={observerRef} className="h-10" />
          {loadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
            </div>
          )}
        </>
      )}
    </main>
  )
}
