import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { docArticles } from "./docs-config"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Guides and reference for how the platform works.",
}

const DocsIndexPage = () => (
  <article>
    <header className="border-b border-border pb-10">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Documentation
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Introduction</h1>
      <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
        Reference material for how the platform works, from the portfolio workflow
        to the models behind verification. Pick a topic to get started.
      </p>
    </header>

    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {docArticles.map((doc) => (
        <Link
          key={doc.href}
          href={doc.href}
          className="group flex flex-col rounded-xl border border-border/70 bg-card/[0.24] p-5 transition-colors hover:border-border hover:bg-card/[0.4]"
        >
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {doc.title}
          </h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
            {doc.description}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Read
            <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  </article>
)

export default DocsIndexPage
