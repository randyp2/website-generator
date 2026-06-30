"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Search, X } from "lucide-react"
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { usePublicAuthGate } from "@/context/PublicAuthGateContext"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

import {
  useExplorePortfoliosInfiniteQuery,
  usePortfolioCardMetricsMap,
  useTogglePortfolioLikeMutation,
} from "../explore.query"
import { ExploreCard } from "./ExploreCard"
import { ExploreEmptyState } from "./ExploreEmptyState"
import { matchesPortfolioFilter } from "./explore.utils"

type ShowcaseMajor = "Design" | "Product" | "Research"
type ShowcaseIndustry = "SaaS" | "Ecommerce" | "AI"
type ShowcaseExperience = "Student" | "Mid-Level" | "Senior"

const NAV_SECTIONS = [
  {
    id: "major",
    label: "Majors",
    options: ["All", "Design", "Product", "Research"] as const,
    description: "Browse by discipline and craft focus.",
  },
  {
    id: "industry",
    label: "Industries",
    options: ["All", "SaaS", "Ecommerce", "AI"] as const,
    description: "See portfolios grouped by target industry.",
  },
  {
    id: "experience",
    label: "Experience",
    options: ["All", "Student", "Mid-Level", "Senior"] as const,
    description: "Compare emerging talent and established professionals.",
  },
] as const

const navTriggerClassName =
  "h-10 rounded-none bg-transparent px-4 text-sm font-medium text-foreground shadow-none hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary data-[active]:bg-transparent data-[state=open]:bg-transparent"

const PAGE_SIZE = 12
const PAGE_HORIZONTAL_PADDING_CLASSNAME =
  "px-8 sm:px-10 md:px-14 lg:px-20 xl:px-28 2xl:px-36"

export const ExplorePageClient = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeMajor, setActiveMajor] = useState<ShowcaseMajor | "All">("All")
  const [activeIndustry, setActiveIndustry] = useState<ShowcaseIndustry | "All">("All")
  const [activeExperience, setActiveExperience] = useState<ShowcaseExperience | "All">("All")
  const [pendingLikeSlugs, setPendingLikeSlugs] = useState<Set<string>>(
    () => new Set(),
  )
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const pendingLikeSlugsRef = useRef<Set<string>>(new Set())
  const { requireAuth } = usePublicAuthGate()
  const portfoliosQuery = useExplorePortfoliosInfiniteQuery(PAGE_SIZE)
  const {
    data: portfolioPages,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = portfoliosQuery
  const { mutate: togglePortfolioLike } = useTogglePortfolioLikeMutation()

  const portfolios = useMemo(
    () => portfolioPages?.pages.flatMap((page) => page.content) ?? [],
    [portfolioPages],
  )
  const metricsBySlug = usePortfolioCardMetricsMap(portfolios)
  const isLoading = isPending || isFetchingNextPage
  const hasPortfolioLoadError = isError && portfolios.length === 0

  const handleToggleLike = useCallback(
    (slug: string) => {
      if (!requireAuth("engagement")) return
      if (pendingLikeSlugsRef.current.has(slug)) return

      const current = metricsBySlug[slug]
      if (!current) return

      pendingLikeSlugsRef.current.add(slug)
      setPendingLikeSlugs((currentSlugs) => {
        const next = new Set(currentSlugs)
        next.add(slug)
        return next
      })

      togglePortfolioLike(
        {
          slug,
          portfolioId: current.portfolioId,
          viewerHasLiked: current.viewerHasLiked,
        },
        {
          onError: (error) => {
            console.error("Failed to toggle like:", error)
          },
          onSettled: () => {
            pendingLikeSlugsRef.current.delete(slug)
            setPendingLikeSlugs((currentSlugs) => {
              const next = new Set(currentSlugs)
              next.delete(slug)
              return next
            })
          },
        },
      )
    },
    [metricsBySlug, requireAuth, togglePortfolioLike],
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage || isFetchingNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage()
        }
      },
      { rootMargin: "200px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const filtered = useMemo(
    () =>
      portfolios.filter((portfolio) =>
        matchesPortfolioFilter(portfolio, "all", deferredSearchQuery),
      ),
    [deferredSearchQuery, portfolios],
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-background pb-16">
      <div className="mx-auto w-full max-w-[112rem] grow">
        <div
          aria-hidden="true"
          className="absolute inset-0 isolate -z-10 overflow-hidden opacity-0 dark:opacity-60"
        >
          <div className="absolute left-0 top-0 h-[80rem] w-[35rem] -translate-y-[21.875rem] -rotate-45 rounded-full [background:radial-gradient(68.54%_68.72%_at_55.02%_31.46%,color-mix(in_oklab,var(--foreground)_6%,transparent)_0%,color-mix(in_oklab,var(--foreground)_2%,transparent)_50%,color-mix(in_oklab,var(--foreground)_1%,transparent)_80%)]" />
          <div className="absolute left-0 top-0 h-[80rem] w-[15rem] translate-x-[5%] -translate-y-[50%] -rotate-45 rounded-full [background:radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklab,var(--foreground)_4%,transparent)_0%,color-mix(in_oklab,var(--foreground)_1%,transparent)_80%,transparent_100%)]" />
          <div className="absolute left-0 top-0 h-[80rem] w-[15rem] -translate-y-[21.875rem] -rotate-45 rounded-full [background:radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklab,var(--foreground)_4%,transparent)_0%,color-mix(in_oklab,var(--foreground)_1%,transparent)_80%,transparent_100%)]" />
        </div>

        <div className={cn(PAGE_HORIZONTAL_PADDING_CLASSNAME, "py-8")}>
          <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
            <div className="hidden md:block" />

            <div className="flex items-center justify-center md:col-start-2">
              <NavigationMenu className="z-20">
                <NavigationMenuList className="gap-0">
                  {NAV_SECTIONS.map((section) => {
                    const selectedValue =
                      section.id === "major"
                        ? activeMajor
                        : section.id === "industry"
                          ? activeIndustry
                          : activeExperience

                    return (
                      <NavigationMenuItem key={section.id}>
                        <NavigationMenuTrigger
                          className={cn(
                            navTriggerClassName,
                            selectedValue !== "All" && "font-semibold text-foreground",
                          )}
                        >
                          {section.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="p-4 pb-1 md:w-[420px]">
                          <div className="mb-4 break-inside-avoid">
                            <h3 className="mb-1 px-2 text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">
                              {section.label}
                            </h3>
                            <p className="px-2 text-xs leading-snug text-muted-foreground">
                              {section.description}
                            </p>
                            <ul className="mt-3 grid gap-1">
                              {section.options.map((option) => (
                                <li key={option}>
                                  <button
                                    type="button"
                                    className={cn(
                                      "block w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent/60",
                                      selectedValue === option && "bg-accent/60",
                                    )}
                                    onClick={() => {
                                      if (section.id === "major") {
                                        setActiveMajor(option as ShowcaseMajor | "All")
                                        return
                                      }

                                      if (section.id === "industry") {
                                        setActiveIndustry(option as ShowcaseIndustry | "All")
                                        return
                                      }

                                      setActiveExperience(option as ShowcaseExperience | "All")
                                    }}
                                  >
                                    <div className="text-sm leading-none font-medium">
                                      {option}
                                    </div>
                                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                                      {option === "All"
                                        ? `Show every portfolio in ${section.label.toLowerCase()}.`
                                        : `Focus on ${option.toLowerCase()} portfolios.`}
                                    </p>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    )
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className="flex w-full items-center justify-end md:col-start-3 md:justify-self-stretch">
              <AnimatePresence mode="popLayout" initial={false}>
                {isSearchOpen ? (
                  <motion.div
                    key="search-input"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative flex max-w-sm items-center overflow-hidden"
                  >
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={searchQuery}
                      onBlur={() => {
                        if (searchQuery.trim().length === 0) {
                          setIsSearchOpen(false)
                        }
                      }}
                      onChange={(event) => {
                        const nextValue = event.target.value
                        startTransition(() => setSearchQuery(nextValue))
                      }}
                      placeholder="Search portfolios, creators..."
                      className="w-full pl-11 pr-10"
                    />
                    <button
                      type="button"
                      aria-label="Clear search"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        startTransition(() => setSearchQuery(""))
                        setIsSearchOpen(false)
                      }}
                      className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:cursor-pointer hover:rotate-90 hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <button
                    key="search-trigger"
                    type="button"
                    aria-label="Search portfolios"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                  </button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 h-px w-full border-b border-dashed border-border" />

        {hasPortfolioLoadError ? (
          <div className={cn(PAGE_HORIZONTAL_PADDING_CLASSNAME, "py-12")}>
            <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6 text-center">
              <p className="text-sm font-medium text-foreground">
                Could not load portfolios.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                Try again
              </button>
            </div>
          </div>
        ) : filtered.length === 0 && !isLoading ? (
          <div className={cn(PAGE_HORIZONTAL_PADDING_CLASSNAME, "py-4")}>
            <ExploreEmptyState hasQuery={deferredSearchQuery.length > 0} />
          </div>
        ) : (
          <div
            className={cn(
              PAGE_HORIZONTAL_PADDING_CLASSNAME,
              "z-10 grid gap-4 py-4 md:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {filtered.map((portfolio) => (
              <ExploreCard
                key={portfolio.slug}
                isLikePending={pendingLikeSlugs.has(portfolio.slug)}
                metrics={metricsBySlug[portfolio.slug] ?? null}
                portfolio={portfolio}
                onToggleLike={handleToggleLike}
              />
            ))}
          </div>
        )}

        {hasNextPage && <div ref={sentinelRef} className="h-1" />}

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    </main>
  )
}
