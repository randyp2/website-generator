import type { Metadata } from "next"
import type { ReactNode } from "react"

import { DocsReadingProgress } from "./DocsReadingProgress"
import { DocsSidebar } from "./DocsSidebar"
import { DOCS_CONTENT_ID } from "./docs-config"

export const metadata: Metadata = {
  title: {
    default: "Documentation",
    template: "%s · Docs",
  },
  description: "Guides and reference for how the platform works.",
}

const DocsLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="grid max-w-[100rem] gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[190px_minmax(0,1fr)_220px]">
      <DocsSidebar />
      <div id={DOCS_CONTENT_ID} className="min-w-0">
        {children}
      </div>
      <DocsReadingProgress />
    </div>
  </div>
)

export default DocsLayout
