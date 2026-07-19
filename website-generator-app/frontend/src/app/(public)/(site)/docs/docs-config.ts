/**
 * Single source of truth for the docs section.
 *
 * The sidebar, the docs landing index, and (later) static param generation all
 * read from this list, so adding a doc means adding one entry and creating its
 * `page.tsx` under `docs/<slug>/`.
 */

export type DocNavItem = {
  /** Absolute route, e.g. "/docs/verification-scoring". */
  href: string
  title: string
  description: string
}

export type DocNavGroup = {
  title: string
  items: DocNavItem[]
}

/** In-page anchor used by the reading-progress rail. */
export type TocItem = {
  href: string
  label: string
}

/** Id of the middle content column; the reading-progress rail measures it. */
export const DOCS_CONTENT_ID = "docs-content"

/**
 * Per-doc in-page sections, keyed by route. A doc appears in the reading-progress
 * rail only if it has an entry here, and each `href` must match a `<section id>`
 * rendered by that page.
 */
export const docSectionsByHref: Record<string, TocItem[]> = {
  "/docs/how-it-works": [
    { href: "#overview", label: "Overview" },
    { href: "#inputs", label: "Start with structure" },
    { href: "#generation", label: "Generate the first version" },
    { href: "#refinement", label: "Refine with guided edits" },
    { href: "#delivery", label: "Publish and manage" },
  ],
  "/docs/engineering": [
    { href: "#why-write-about-the-code", label: "Why write about the code" },
    { href: "#the-first-version", label: "The first version" },
    { href: "#why-not-sse", label: "Why not SSE" },
    { href: "#portfolio-generation", label: "Portfolio generation" },
    { href: "#target-architecture", label: "Target architecture" },
    { href: "#what-runs-today", label: "What runs today" },
    { href: "#billing-idempotency", label: "Billing idempotency" },
    { href: "#verification-jobs", label: "Recoverable verification" },
    { href: "#security-boundaries", label: "Security boundaries" },
    { href: "#code-map", label: "Code map" },
    { href: "#tradeoffs", label: "Tradeoffs" },
  ],
  "/docs/verification-scoring": [
    { href: "#why-this-exists", label: "Why this exists" },
    { href: "#what-the-score-means", label: "What the score means" },
    { href: "#where-claims-start", label: "Where every claim starts" },
    { href: "#what-counts-as-evidence", label: "What counts as evidence" },
    { href: "#keeping-evidence-honest", label: "Keeping evidence honest" },
    { href: "#turning-evidence-into-a-score", label: "Turning evidence into a score" },
    { href: "#the-expert-tier", label: "The expert tier" },
    { href: "#profile-rollup", label: "From one claim to the profile" },
    { href: "#how-i-tested-it", label: "How I tested it" },
    { href: "#where-it-stands", label: "Where it stands now" },
  ],
}

export const docsNavGroups: DocNavGroup[] = [
  {
    title: "Getting started",
    items: [
      {
        href: "/docs",
        title: "Introduction",
        description: "What the documentation covers and how it is organized.",
      },
      {
        href: "/docs/how-it-works",
        title: "How it works",
        description:
          "The workflow that turns resume data and style direction into a published portfolio.",
      },
    ],
  },
  {
    title: "Verification",
    items: [
      {
        href: "/docs/verification-scoring",
        title: "Verification scoring",
        description:
          "How verification progress is calculated from evidence, authorship, and independence.",
      },
    ],
  },
  {
    title: "Engineering",
    items: [
      {
        href: "/docs/engineering",
        title: "Engineering notes",
        description:
          "The interesting problems behind PortRN, starting with asynchronous portfolio generation.",
      },
    ],
  },
]

/** Doc pages shown as cards on the /docs landing (excludes the index itself). */
export const docArticles: DocNavItem[] = docsNavGroups
  .flatMap((group) => group.items)
  .filter((item) => item.href !== "/docs")
