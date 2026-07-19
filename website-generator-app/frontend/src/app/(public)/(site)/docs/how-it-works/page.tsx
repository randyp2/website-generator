import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Bot,
  FileText,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How PortRN turns resume data, uploaded assets, and style direction into a polished portfolio website.",
}

const workflow = [
  {
    id: "overview",
    eyebrow: "Overview",
    title: "Website workflow",
    body:
      "PortRN turns resume content, portfolio structure, and style direction into a publishable personal site. The product is built to reduce blank-page work, keep iteration fast, and let users refine output instead of assembling every section manually.",
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

const HowItWorksPage = () => (
  <article>
    <header className="border-b border-border/70 pb-10">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Product docs
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        How PortRN works
      </h1>
      <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
        A concise view of how the platform turns resume data, uploaded assets,
        and style direction into a polished portfolio website.
      </p>
    </header>

    <div className="mt-10">
      <section id="overview" className="scroll-mt-28 border-b border-border/70 pb-12">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
            {workflow[0].eyebrow}
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            {workflow[0].title}
          </h2>
          <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
            {workflow[0].body}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {principles.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border/70 bg-card/[0.32] px-5 py-5"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
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
          const Icon = item.icon ?? Sparkles

          return (
            <section
              key={item.id}
              id={item.id}
              className="scroll-mt-28 border-b border-border/70 py-12"
            >
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                {item.eyebrow}
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                {item.title}
              </h2>
              <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
                {item.body}
              </p>

              <div className="mt-6 rounded-xl border border-border/70 bg-card/[0.3] px-5 py-5">
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
            </section>
          )
        })}

        <section className="py-12">
          <div className="flex flex-col gap-6 rounded-2xl bg-[linear-gradient(125deg,#4a3620_0%,#554023_36%,#8a6733_70%,#c99846_100%)] px-8 py-8 shadow-lg shadow-black/25 ring-1 ring-white/10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.22em] text-amber-100/70">
                Next step
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                Start from the main builder flow when you are ready.
              </h2>
              <p className="mt-4 text-sm leading-7 text-amber-50/80">
                Create an account or return to your workspace to upload your resume,
                choose a template, and continue through the guided portfolio pipeline.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="public-action-button rounded-xl border border-white/25 text-white transition-colors hover:bg-white/10"
              >
                Go to home
              </Link>
              <Link
                href="/dashboard"
                className="group public-action-button rounded-xl bg-white font-medium text-[#554023] transition-colors hover:bg-amber-50"
              >
                Open dashboard
                <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
    </div>
  </article>
)

export default HowItWorksPage
