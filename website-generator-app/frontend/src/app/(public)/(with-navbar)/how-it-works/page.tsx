import Link from "next/link"
import {
  ArrowRight,
  Bot,
  FileText,
  Layers3,
  LayoutTemplate,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

const workflow = [
  {
    id: "overview",
    eyebrow: "Overview",
    title: "Website workflow",
    body:
      "Webgen turns resume content, portfolio structure, and style direction into a publishable personal site. The product is built to reduce blank-page work, keep iteration fast, and let users refine output instead of assembling every section manually.",
  },
  {
    id: "inputs",
    eyebrow: "Step 01",
    title: "Start with structure",
    body:
      "Users begin by creating a portfolio draft, selecting a layout direction, and uploading a resume or supporting media. The system uses those inputs to create a usable content foundation before any visual refinement begins.",
    points: [
      "Resume parsing extracts experience, education, projects, and skills.",
      "Template selection defines the initial page rhythm and section order.",
      "Uploads add supporting assets that can be used throughout the portfolio.",
    ],
    icon: FileText,
  },
  {
    id: "generation",
    eyebrow: "Step 02",
    title: "Generate the first version",
    body:
      "Once the base inputs are available, the platform composes portfolio sections and generates a first working version. This removes the need to draft every headline, paragraph, and layout decision from scratch.",
    points: [
      "AI organizes resume content into portfolio-friendly sections.",
      "The first pass establishes tone, hierarchy, and presentation.",
      "Users get a concrete version to react to instead of an empty editor.",
    ],
    icon: Bot,
  },
  {
    id: "refinement",
    eyebrow: "Step 03",
    title: "Refine with guided edits",
    body:
      "After the initial build, users continue through a review and refinement flow. They can adjust style, clarify direction, improve copy, and iterate on versions without losing the earlier structure.",
    points: [
      "Review screens help confirm extracted information before publishing.",
      "Style prompts let users steer visual mood and communication style.",
      "Versioning supports experimentation while keeping previous revisions intact.",
    ],
    icon: Sparkles,
  },
  {
    id: "delivery",
    eyebrow: "Step 04",
    title: "Publish and manage",
    body:
      "When the portfolio is ready, the platform supports publishing, revisiting saved work, exporting output, and continuing edits from the authenticated dashboard. The result is a workflow closer to product iteration than traditional page building.",
    points: [
      "Saved portfolios remain accessible from the user dashboard.",
      "Published work can be revisited and updated over time.",
      "The system is designed for fast iteration rather than one-time generation.",
    ],
    icon: Rocket,
  },
]

const toc = [
  { href: "#overview", label: "Overview" },
  { href: "#inputs", label: "Start with structure" },
  { href: "#generation", label: "Generate the first version" },
  { href: "#refinement", label: "Refine with guided edits" },
  { href: "#delivery", label: "Publish and manage" },
]

const principles = [
  {
    title: "Minimal manual setup",
    description: "The workflow begins with content you already have rather than a blank portfolio canvas.",
  },
  {
    title: "AI as an editor",
    description: "Generation is the starting point. Review and refinement are treated as first-class parts of the product.",
  },
  {
    title: "Version-aware building",
    description: "Users can iterate on direction without discarding previous working versions.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70">
        <div className="px-6 py-16 sm:px-10 lg:px-14 xl:px-20">
          <div className="max-w-4xl">
            <p className="text-sm font-medium tracking-[0.22em] text-muted-foreground uppercase">
              Product Docs
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              How Webgen works
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              A concise view of how the platform turns resume data, uploaded assets,
              and style direction into a polished portfolio website.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-12 px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:px-14 xl:px-20">
        <div className="min-w-0">
          <section
            id="overview"
            className="border-b border-border/70 pb-12 scroll-mt-28"
          >
            <div className="max-w-4xl">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                {workflow[0].eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                {workflow[0].title}
              </h2>
              <p className="mt-6 text-base leading-8 text-muted-foreground">
                {workflow[0].body}
              </p>
            </div>

            <div className="mt-10 grid gap-4 xl:grid-cols-3">
              {principles.map((item) => (
                <div
                  key={item.title}
                  className="border border-border/70 bg-card/[0.32] px-5 py-5"
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-4 text-primary" />
                    <div>
                      <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {workflow.slice(1).map((item) => {
            const Icon = item.icon

            return (
              <section
                key={item.id}
                id={item.id}
                className="border-b border-border/70 py-12 scroll-mt-28"
              >
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="max-w-3xl">
                    <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                      {item.eyebrow}
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                      {item.title}
                    </h2>
                    <p className="mt-6 text-base leading-8 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>

                  <div className="border border-border/70 bg-card/[0.3] px-5 py-5">
                    <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                      <Icon className="size-4 text-primary" />
                      Workflow note
                    </div>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                      {item.points?.map((point) => (
                        <li key={point} className="flex gap-3">
                          <span className="mt-[0.72rem] h-px w-4 shrink-0 bg-border" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )
          })}

          <section className="py-12">
            <div className="flex flex-col gap-6 border border-border/70 bg-card/[0.24] px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  Next step
                </p>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  Start from the main builder flow when you are ready.
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  Create an account or return to your workspace to upload your resume,
                  choose a template, and continue through the guided portfolio pipeline.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Go to home
                </Link>
                <Link
                  href="/dashboard-user"
                  className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 border-l border-border/70 pl-6">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              On this page
            </p>
            <nav className="mt-5 space-y-3">
              {toc.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="text-xs text-muted-foreground/70">
                    0{index + 1}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-10 border border-border/70 bg-card/[0.28] px-4 py-4">
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
        </aside>
      </div>
    </div>
  )
}
