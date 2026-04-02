"use client"

import { Eye, Heart, MessageCircle, Search } from "lucide-react"
import { useDeferredValue, useState } from "react"

import { LazyImage } from "@/components/ui/lazy-image"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

interface PortfolioShowcaseItem {
  title: string
  slug: string
  summary: string
  image: string
  publishedAt: string
  ownerName: string
  ownerAvatar: string
  specialty: string
  major: "Design" | "Product" | "Research"
  industry: "SaaS" | "Ecommerce" | "AI"
  experience: "Student" | "Mid-Level" | "Senior"
  likes: number
  views: number
  comments: number
}

type ShowcaseMajor = PortfolioShowcaseItem["major"]
type ShowcaseIndustry = PortfolioShowcaseItem["industry"]
type ShowcaseExperience = PortfolioShowcaseItem["experience"]

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

const portfolioShowcaseItems: PortfolioShowcaseItem[] = [
  {
    title: "Design Systems Portfolio",
    slug: "#",
    summary:
      "A product designer portfolio focused on scalable systems, documentation, and cross-team UI governance.",
    image: "https://picsum.photos/seed/1/640/360",
    publishedAt: "2025-08-25",
    ownerName: "Ava Mitchell",
    ownerAvatar: "https://picsum.photos/seed/avatar-1/80/80",
    specialty: "Systems Designer",
    major: "Design",
    industry: "SaaS",
    experience: "Senior",
    likes: 682,
    views: 12400,
    comments: 48,
  },
  {
    title: "Color Strategy Portfolio",
    slug: "#",
    summary:
      "A visual design portfolio exploring brand systems, color psychology, and conversion-focused ecommerce interfaces.",
    image: "https://picsum.photos/seed/2/640/360",
    publishedAt: "2025-07-14",
    ownerName: "Liam Carter",
    ownerAvatar: "https://picsum.photos/seed/avatar-2/80/80",
    specialty: "Brand Researcher",
    major: "Research",
    industry: "Ecommerce",
    experience: "Mid-Level",
    likes: 431,
    views: 8900,
    comments: 31,
  },
  {
    title: "Interaction Lab Portfolio",
    slug: "#",
    summary:
      "A portfolio showcasing product interaction work, motion-driven flows, and polished onboarding experiences.",
    image: "https://picsum.photos/seed/3/640/360",
    publishedAt: "2025-06-30",
    ownerName: "Sophia Kim",
    ownerAvatar: "https://picsum.photos/seed/avatar-3/80/80",
    specialty: "Product Designer",
    major: "Product",
    industry: "SaaS",
    experience: "Mid-Level",
    likes: 508,
    views: 10200,
    comments: 26,
  },
  {
    title: "Accessible Product Portfolio",
    slug: "#",
    summary:
      "A UX portfolio centered on inclusive workflows, accessibility audits, and practical design governance.",
    image: "https://picsum.photos/seed/4/640/360",
    publishedAt: "2025-06-18",
    ownerName: "Ethan Rodriguez",
    ownerAvatar: "https://picsum.photos/seed/avatar-4/80/80",
    specialty: "Accessibility Lead",
    major: "Research",
    industry: "AI",
    experience: "Senior",
    likes: 790,
    views: 15600,
    comments: 54,
  },
  {
    title: "Dark UI Portfolio",
    slug: "#",
    summary:
      "A curated set of interface explorations featuring theme systems, polished surfaces, and visual consistency.",
    image: "https://picsum.photos/seed/5/640/360",
    publishedAt: "2025-05-20",
    ownerName: "Maya Chen",
    ownerAvatar: "https://picsum.photos/seed/avatar-5/80/80",
    specialty: "Visual Designer",
    major: "Design",
    industry: "SaaS",
    experience: "Mid-Level",
    likes: 316,
    views: 7300,
    comments: 19,
  },
  {
    title: "Typography Portfolio",
    slug: "#",
    summary:
      "A portfolio built around editorial hierarchy, interface readability, and strong type-led visual systems.",
    image: "https://picsum.photos/seed/6/640/360",
    publishedAt: "2025-05-02",
    ownerName: "Noah Patel",
    ownerAvatar: "https://picsum.photos/seed/avatar-6/80/80",
    specialty: "Editorial Designer",
    major: "Design",
    industry: "Ecommerce",
    experience: "Senior",
    likes: 604,
    views: 11700,
    comments: 35,
  },
  {
    title: "Motion Portfolio",
    slug: "#",
    summary:
      "A product portfolio featuring animated prototypes, advanced transitions, and interaction case studies.",
    image: "https://picsum.photos/seed/7/640/360",
    publishedAt: "2025-04-15",
    ownerName: "Chloe Ramirez",
    ownerAvatar: "https://picsum.photos/seed/avatar-7/80/80",
    specialty: "Motion Designer",
    major: "Product",
    industry: "AI",
    experience: "Senior",
    likes: 728,
    views: 14300,
    comments: 42,
  },
  {
    title: "Creative Direction Portfolio",
    slug: "#",
    summary:
      "A portfolio balancing minimal and expressive product directions across concept work and shipped interfaces.",
    image: "https://picsum.photos/seed/8/640/360",
    publishedAt: "2025-04-01",
    ownerName: "Benjamin Scott",
    ownerAvatar: "https://picsum.photos/seed/avatar-8/80/80",
    specialty: "Creative Director",
    major: "Design",
    industry: "SaaS",
    experience: "Senior",
    likes: 455,
    views: 9800,
    comments: 24,
  },
  {
    title: "Mobile Product Portfolio",
    slug: "#",
    summary:
      "A mobile-first portfolio with responsive flows, native patterns, and performance-conscious product decisions.",
    image: "https://picsum.photos/seed/9/640/360",
    publishedAt: "2025-03-22",
    ownerName: "Isabella White",
    ownerAvatar: "https://picsum.photos/seed/avatar-9/80/80",
    specialty: "Mobile Product Designer",
    major: "Product",
    industry: "Ecommerce",
    experience: "Mid-Level",
    likes: 382,
    views: 8600,
    comments: 22,
  },
  {
    title: "Figma Systems Portfolio",
    slug: "#",
    summary:
      "A workflow-focused portfolio highlighting design ops, libraries, rapid prototyping, and system maintenance.",
    image: "https://picsum.photos/seed/10/640/360",
    publishedAt: "2025-03-09",
    ownerName: "James Walker",
    ownerAvatar: "https://picsum.photos/seed/avatar-10/80/80",
    specialty: "Design Ops",
    major: "Design",
    industry: "AI",
    experience: "Student",
    likes: 241,
    views: 6200,
    comments: 15,
  },
  {
    title: "AI Product Portfolio",
    slug: "#",
    summary:
      "A portfolio of AI-native product work covering copilots, generative interfaces, and trust-building UX.",
    image: "https://picsum.photos/seed/11/640/360",
    publishedAt: "2025-02-28",
    ownerName: "Olivia Brooks",
    ownerAvatar: "https://picsum.photos/seed/avatar-11/80/80",
    specialty: "AI Product Designer",
    major: "Product",
    industry: "AI",
    experience: "Mid-Level",
    likes: 667,
    views: 13100,
    comments: 37,
  },
  {
    title: "Prototype Research Portfolio",
    slug: "#",
    summary:
      "A research-driven portfolio combining testing insights, iterative prototypes, and stakeholder-ready narratives.",
    image: "https://picsum.photos/seed/12/640/360",
    publishedAt: "2025-02-14",
    ownerName: "Daniel Green",
    ownerAvatar: "https://picsum.photos/seed/avatar-12/80/80",
    specialty: "UX Researcher",
    major: "Research",
    industry: "SaaS",
    experience: "Student",
    likes: 198,
    views: 5400,
    comments: 12,
  },
]

const navTriggerClassName =
  "h-10 rounded-none bg-transparent px-4 text-sm font-medium text-foreground shadow-none hover:bg-transparent hover:text-foreground/75 focus:bg-transparent focus:text-foreground/75 data-[active]:bg-transparent data-[state=open]:bg-transparent"

export const PortfolioShowcaseSection = () => {
  const [activeMajor, setActiveMajor] = useState<ShowcaseMajor | "All">("All")
  const [activeIndustry, setActiveIndustry] = useState<ShowcaseIndustry | "All">("All")
  const [activeExperience, setActiveExperience] = useState<ShowcaseExperience | "All">("All")
  const deferredSearchQuery = useDeferredValue("")

  const filteredPortfolios = portfolioShowcaseItems.filter((portfolio) => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase()
    const matchesSearch =
      normalizedQuery.length === 0 ||
      portfolio.title.toLowerCase().includes(normalizedQuery) ||
      portfolio.ownerName.toLowerCase().includes(normalizedQuery) ||
      portfolio.summary.toLowerCase().includes(normalizedQuery) ||
      portfolio.specialty.toLowerCase().includes(normalizedQuery)

    if (!matchesSearch) {
      return false
    }

    const matchesMajor = activeMajor === "All" || portfolio.major === activeMajor
    const matchesIndustry =
      activeIndustry === "All" || portfolio.industry === activeIndustry
    const matchesExperience =
      activeExperience === "All" || portfolio.experience === activeExperience

    return matchesMajor && matchesIndustry && matchesExperience
  })

  return (
    <div className="mx-auto w-full max-w-[112rem] grow">
      <div
        aria-hidden="true"
        className="absolute inset-0 isolate -z-10 overflow-hidden opacity-60"
      >
        <div className="absolute left-0 top-0 h-[80rem] w-[35rem] -translate-y-[21.875rem] -rotate-45 rounded-full [background:radial-gradient(68.54%_68.72%_at_55.02%_31.46%,color-mix(in_oklab,var(--foreground)_6%,transparent)_0%,color-mix(in_oklab,var(--foreground)_2%,transparent)_50%,color-mix(in_oklab,var(--foreground)_1%,transparent)_80%)]" />
        <div className="absolute left-0 top-0 h-[80rem] w-[15rem] translate-x-[5%] -translate-y-[50%] -rotate-45 rounded-full [background:radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklab,var(--foreground)_4%,transparent)_0%,color-mix(in_oklab,var(--foreground)_1%,transparent)_80%,transparent_100%)]" />
        <div className="absolute left-0 top-0 h-[80rem] w-[15rem] -translate-y-[21.875rem] -rotate-45 rounded-full [background:radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklab,var(--foreground)_4%,transparent)_0%,color-mix(in_oklab,var(--foreground)_1%,transparent)_80%,transparent_100%)]" />
      </div>

      <div className="px-6 py-8 sm:px-8 lg:px-10">
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
                          selectedValue !== "All" && "text-primary",
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

          <div className="flex w-full justify-end md:col-start-3 md:justify-self-stretch">
            <button
              type="button"
              aria-label="Search portfolios"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 h-px w-full border-b border-dashed border-border" />

      <div className="z-10 grid gap-4 px-6 py-4 sm:px-8 lg:px-10 md:grid-cols-2 lg:grid-cols-3">
        {filteredPortfolios.map((portfolio) => (
          <a
            href={portfolio.slug}
            key={portfolio.title}
            className="group flex flex-col gap-2 rounded-lg p-2 duration-75 hover:bg-accent/60 active:bg-accent"
          >
            <LazyImage
              src={portfolio.image}
              fallback="https://placehold.co/640x360?text=fallback-image"
              inView={true}
              alt={portfolio.title}
              ratio={16 / 9}
              className="transition-all duration-500 group-hover:scale-105"
            />
            <div className="space-y-2 px-2 pb-2">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                <p>{portfolio.publishedAt}</p>
                <div className="size-1 rounded-full bg-muted-foreground" />
                <p>{portfolio.specialty}</p>
              </div>
              <h2 className="line-clamp-2 text-lg font-semibold leading-5 tracking-tight">
                {portfolio.title}
              </h2>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {portfolio.summary}
              </p>
              <div className="flex items-end justify-between gap-4 pt-2">
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portfolio.ownerAvatar}
                    alt={portfolio.ownerName}
                    className="size-9 rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {portfolio.ownerName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {portfolio.major}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Heart className="size-4" />
                    <span>{portfolio.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="size-4" />
                    <span>{portfolio.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="size-4" />
                    <span>{portfolio.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
